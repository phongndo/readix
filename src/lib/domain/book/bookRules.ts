import type { Book } from './Book';

export function calculateProgressPercentage(book: Book): number {
	if (book.totalPages === 0) return 0;
	return Math.round((book.currentPage / book.totalPages) * 100);
}

export function isBookCompleted(book: Book): boolean {
	return book.currentPage >= book.totalPages;
}

export function canUpdateProgress(book: Book, newPage: number): boolean {
	return newPage >= 0 && newPage <= book.totalPages;
}

export function pagesReadToday(sessions: Array<{ createdAt: Date; pagesRead: number }>): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return sessions.filter((s) => s.createdAt >= today).reduce((total, s) => total + s.pagesRead, 0);
}

export function estimateReadingTimeMinutes(
	pages: number,
	wordsPerPage = 250,
	wordsPerMinute = 200
): number {
	const totalWords = pages * wordsPerPage;
	return Math.ceil(totalWords / wordsPerMinute);
}
