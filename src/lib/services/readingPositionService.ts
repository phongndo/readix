import { Effect } from 'effect';
import { calculateReadingProgress, shouldSavePosition } from '$lib/domain/reading/readingRules';
import type { ReadingPosition } from '$lib/domain/reading/ReadingPosition';
import { readerStore } from '$lib/features/reader/reader.store.svelte';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';
import { forkLoggedEffect } from '$lib/effect/runtime';
import { lookupConvexUserByClerkId } from '$lib/services/userService';

export function createPositionTracker(
	clerkUserId: string,
	bookId: string,
	format: 'pdf' | 'epub' | 'text'
) {
	let lastSavedPosition: ReadingPosition | null = null;
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let cachedUserId: Id<'users'> | null = null;

	const formatError = (error: unknown): string =>
		error instanceof Error ? error.message : String(error);

	const resolveUserId = (): Effect.Effect<Id<'users'>, Error, never> => {
		if (cachedUserId) {
			return Effect.succeed(cachedUserId);
		}

		return lookupConvexUserByClerkId(clerkUserId).pipe(
			Effect.flatMap((user) =>
				user ? Effect.succeed(user._id as Id<'users'>) : Effect.fail(new Error('User not found'))
			),
			Effect.tap((userId) =>
				Effect.sync(() => {
					cachedUserId = userId;
				})
			),
			Effect.mapError((error) => new Error(`Failed to lookup user: ${formatError(error)}`))
		);
	};

	const loadPosition = (): Effect.Effect<ReadingPosition | null, Error, never> =>
		Effect.gen(function* () {
			const userId = yield* resolveUserId();

			const result = yield* Effect.tryPromise({
				try: async () => {
					return (await convexClient.query(api.readingPositions.getPosition, {
						bookId: bookId as Id<'books'>,
						userId
					})) as ReadingPosition | null;
				},
				catch: (error) => new Error(`Failed to load position: ${formatError(error)}`)
			});

			if (result) {
				readerStore.setCurrentPage(result.page);
				readerStore.setScrollOffset(result.scrollOffset);
				lastSavedPosition = result;
			}

			return result;
		});

	const savePosition = (): Effect.Effect<void, Error, never> =>
		Effect.gen(function* () {
			const userId = yield* resolveUserId();

			const position: ReadingPosition = {
				bookId,
				userId: clerkUserId,
				format,
				page: readerStore.currentPage,
				scrollOffset: readerStore.scrollOffset,
				timestamp: Date.now()
			};

			if (!shouldSavePosition(position, lastSavedPosition)) {
				return;
			}

			yield* Effect.tryPromise({
				try: async () => {
					await convexClient.mutation(api.readingPositions.savePosition, {
						position: {
							...position,
							bookId: bookId as Id<'books'>,
							userId
						}
					});
					lastSavedPosition = position;
				},
				catch: (error) => new Error(`Failed to save position: ${formatError(error)}`)
			});
		});

	const scheduleSave = (delayMs = 2000): void => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			forkLoggedEffect(savePosition(), 'Failed to save reading position');
		}, delayMs);
	};

	const saveImmediately = (): Effect.Effect<void, Error, never> => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}
		return savePosition();
	};

	const updateFromScroll = (scrollOffset: number, pageHeights: number[]): void => {
		readerStore.setScrollOffset(scrollOffset);

		let accumulatedHeight = 0;
		for (let i = 0; i < pageHeights.length; i += 1) {
			accumulatedHeight += pageHeights[i];
			if (scrollOffset < accumulatedHeight) {
				if (readerStore.currentPage !== i + 1) {
					readerStore.setCurrentPage(i + 1);
				}
				break;
			}
		}

		scheduleSave();
	};

	const scheduleSaveFromScroll = (scrollOffset: number): void => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			readerStore.setScrollOffset(scrollOffset);
			forkLoggedEffect(savePosition(), 'Failed to save reading position');
		}, 2000);
	};

	const navigateToPage = (pageNum: number, pageHeights: number[]): void => {
		const targetPage = Math.max(1, Math.min(pageNum, readerStore.totalPages));
		readerStore.setCurrentPage(targetPage);

		let offset = 0;
		for (let i = 0; i < targetPage - 1 && i < pageHeights.length; i += 1) {
			offset += pageHeights[i];
		}
		readerStore.setScrollOffset(offset);

		forkLoggedEffect(savePosition(), 'Failed to save reading position');
	};

	const getProgress = (): number => {
		return calculateReadingProgress(readerStore.currentPage, readerStore.totalPages);
	};

	const cleanup = (): void => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}
	};

	return {
		loadPosition,
		savePosition,
		saveImmediately,
		scheduleSave,
		scheduleSaveFromScroll,
		updateFromScroll,
		navigateToPage,
		getProgress,
		cleanup
	};
}
