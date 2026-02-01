import { Effect } from 'effect';
import { calculateReadingProgress, shouldSavePosition } from '$lib/domain/reading/readingRules';
import type { ReadingPosition } from '$lib/domain/reading/ReadingPosition';
import { readerStore } from '$lib/features/reader/reader.store.svelte';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';

/**
 * Service for tracking and persisting reading position
 * Handles saving to Convex and restoring on load
 *
 * Note: userId is a Clerk ID (string), we lookup the Convex user to get the proper Id<'users'>
 */
export function createPositionTracker(
	clerkUserId: string,
	bookId: string,
	format: 'pdf' | 'epub' | 'text'
) {
	let lastSavedPosition: ReadingPosition | null = null;
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Lookup Convex user by Clerk ID
	 */
	const lookupUser = (): Effect.Effect<{ _id: Id<'users'> }, Error, never> => {
		return Effect.tryPromise({
			try: async () => {
				const user = await convexClient.query(api.users.getByClerkId, {
					clerkId: clerkUserId
				});
				if (!user) {
					throw new Error('User not found');
				}
				return user;
			},
			catch: (error) => new Error(`Failed to lookup user: ${error}`)
		});
	};

	/**
	 * Load saved position from database
	 */
	const loadPosition = (): Effect.Effect<ReadingPosition | null, Error, never> => {
		return Effect.gen(function* () {
			// Lookup Convex user first (Clerk ID -> Convex ID)
			const user = yield* lookupUser();

			const result = yield* Effect.tryPromise({
				try: async () => {
					return (await convexClient.query(api.readingPositions.getPosition, {
						bookId: bookId as Id<'books'>,
						userId: user._id
					})) as ReadingPosition | null;
				},
				catch: (error) => new Error(`Failed to load position: ${error}`)
			});

			if (result) {
				readerStore.setCurrentPage(result.page);
				readerStore.setScrollOffset(result.scrollOffset);
				lastSavedPosition = result;
			}

			return result;
		});
	};

	/**
	 * Save current position to database
	 */
	const savePosition = (): Effect.Effect<void, Error, never> => {
		return Effect.gen(function* () {
			// Lookup Convex user first (Clerk ID -> Convex ID)
			const user = yield* lookupUser();

			const position: ReadingPosition = {
				bookId,
				userId: clerkUserId,
				format,
				page: readerStore.currentPage,
				scrollOffset: readerStore.scrollOffset,
				timestamp: Date.now()
			};

			// Check if worth saving
			if (!shouldSavePosition(position, lastSavedPosition)) {
				return;
			}

			yield* Effect.tryPromise({
				try: async () => {
					await convexClient.mutation(api.readingPositions.savePosition, {
						position: {
							...position,
							bookId: bookId as Id<'books'>,
							userId: user._id
						}
					});
					lastSavedPosition = position;
				},
				catch: (error) => new Error(`Failed to save position: ${error}`)
			});
		});
	};

	/**
	 * Debounced save - prevents excessive saves while scrolling
	 */
	const scheduleSave = (delayMs = 2000): void => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			Effect.runPromise(savePosition()).catch(console.error);
		}, delayMs);
	};

	/**
	 * Immediate save - for page unload/exit
	 */
	const saveImmediately = (): Effect.Effect<void, Error, never> => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}
		return savePosition();
	};

	/**
	 * Update position from scroll event (updates store)
	 */
	const updateFromScroll = (scrollOffset: number, pageHeights: number[]): void => {
		readerStore.setScrollOffset(scrollOffset);

		// Calculate current page from scroll position
		let accumulatedHeight = 0;
		for (let i = 0; i < pageHeights.length; i++) {
			accumulatedHeight += pageHeights[i];
			if (scrollOffset < accumulatedHeight) {
				if (readerStore.currentPage !== i + 1) {
					readerStore.setCurrentPage(i + 1);
				}
				break;
			}
		}

		// Schedule save
		scheduleSave();
	};

	/**
	 * Schedule save from scroll offset (no store updates - avoids circular deps)
	 */
	const scheduleSaveFromScroll = (scrollOffset: number): void => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			// Update store for save (position object uses readerStore values)
			readerStore.setScrollOffset(scrollOffset);
			Effect.runPromise(savePosition()).catch(console.error);
		}, 2000);
	};

	/**
	 * Navigate to specific page
	 */
	const navigateToPage = (pageNum: number, pageHeights: number[]): void => {
		const targetPage = Math.max(1, Math.min(pageNum, readerStore.totalPages));
		readerStore.setCurrentPage(targetPage);

		// Calculate scroll offset for this page
		let offset = 0;
		for (let i = 0; i < targetPage - 1 && i < pageHeights.length; i++) {
			offset += pageHeights[i];
		}
		readerStore.setScrollOffset(offset);

		// Save immediately on manual navigation
		Effect.runPromise(savePosition()).catch(console.error);
	};

	/**
	 * Get reading progress percentage
	 */
	const getProgress = (): number => {
		return calculateReadingProgress(readerStore.currentPage, readerStore.totalPages);
	};

	/**
	 * Cleanup
	 */
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
