import { browser } from '$app/environment';
import { readingState } from '$lib/state/readingState.svelte';
import { updateBookProgress } from '$lib/services/bookService';
import { recordReadingSession } from '$lib/services/progressService';
import { runAppEffect } from '$lib/effect/runtime';
import type { Book } from '$lib/domain/book/Book';

export function startReading(book: Book): void {
	if (!browser) return;
	readingState.startReading(book, book.currentPage);
}

export function updatePage(page: number): void {
	if (!browser) return;
	readingState.updatePage(page);
}

export function goToPage(pageNumber: number): void {
	if (!browser) return;
	readingState.updatePage(Math.max(0, pageNumber));
}

export function goToNextPage(): void {
	if (!browser) return;
	const state = readingState.state;

	if (state.currentBook && state.currentPage < state.currentBook.totalPages) {
		readingState.updatePage(state.currentPage + 1);
	}
}

export function goToPreviousPage(): void {
	if (!browser) return;
	const state = readingState.state;

	if (state.currentPage > 0) {
		readingState.updatePage(state.currentPage - 1);
	}
}

export async function saveProgress(userId: string): Promise<string[]> {
	if (!browser) return [];

	const sessionData = readingState.getSessionData();
	if (!sessionData) return [];

	const { bookId, startPage, endPage, durationMinutes } = sessionData;
	const pagesRead = Math.max(0, endPage - startPage);
	const trackedDurationMinutes = Math.max(durationMinutes, pagesRead > 0 ? 1 : 0);

	try {
		await runAppEffect(updateBookProgress(bookId as unknown as string, userId, endPage));

		let newAchievements: string[] = [];
		if (pagesRead > 0 || trackedDurationMinutes > 0) {
			newAchievements = await runAppEffect(
				recordReadingSession(
					userId,
					bookId as unknown as string,
					startPage,
					endPage,
					trackedDurationMinutes
				)
			);
		}

		return newAchievements;
	} catch (error) {
		console.error('Failed to save progress:', error);
		throw error;
	}
}

export function stopReading(): void {
	if (!browser) return;
	readingState.stopReading();
}

export function finishReading(): void {
	if (!browser) return;
	readingState.reset();
}
