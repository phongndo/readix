import { Effect } from 'effect';
import { browser } from '$app/environment';
import { readingStore } from '$lib/stores/readingStore';
import { libraryStore } from '$lib/stores/libraryStore';
import { updateBookProgress } from '$lib/services/bookService';
import { recordReadingSession, checkAndAwardAchievements } from '$lib/services/progressService';
import type { Book } from '$lib/domain/book/Book';

export function startReading(book: Book): void {
	if (!browser) return;
	readingStore.startReading(book, book.currentPage);
}

export function updatePage(page: number): void {
	if (!browser) return;
	readingStore.updatePage(page);
}

export function goToPage(pageNumber: number): void {
	if (!browser) return;
	readingStore.updatePage(Math.max(0, pageNumber));
}

export function goToNextPage(): void {
	if (!browser) return;
	let state: { currentPage: number; currentBook: Book | null } | undefined;
	readingStore.subscribe((s) => {
		state = s;
	})();

	if (state?.currentBook && state.currentPage < state.currentBook.totalPages) {
		readingStore.updatePage(state.currentPage + 1);
	}
}

export function goToPreviousPage(): void {
	if (!browser) return;
	let state: { currentPage: number } | undefined;
	readingStore.subscribe((s) => {
		state = s;
	})();

	if (state && state.currentPage > 0) {
		readingStore.updatePage(state.currentPage - 1);
	}
}

export async function saveProgress(userId: string): Promise<string[]> {
	if (!browser) return [];

	const sessionData = readingStore.getSessionData();
	if (!sessionData) return [];

	const { bookId, startPage, endPage, durationMinutes } = sessionData;

	try {
		// Execute Effects using runPromise (browser-safe)
		await Effect.runPromise(updateBookProgress(bookId as unknown as string, userId, endPage));

		if (endPage > startPage) {
			await Effect.runPromise(
				recordReadingSession(
					userId,
					bookId as unknown as string,
					startPage,
					endPage,
					durationMinutes
				)
			);
		}

		const newAchievements = await Effect.runPromise(checkAndAwardAchievements(userId));

		libraryStore.updateBook(bookId as unknown as string, { currentPage: endPage });

		return newAchievements;
	} catch (error) {
		console.error('Failed to save progress:', error);
		throw error;
	}
}

export function stopReading(): void {
	if (!browser) return;
	readingStore.stopReading();
}

export function finishReading(): void {
	if (!browser) return;
	readingStore.reset();
}
