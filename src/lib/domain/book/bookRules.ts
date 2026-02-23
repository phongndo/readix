import type { Book } from './Book';

export function calculateProgressPercentage(book: Book): number {
	const totalPages = Math.max(1, book.totalPages);
	const currentPage = Math.max(0, Math.min(book.currentPage, totalPages));
	return Math.round((currentPage / totalPages) * 100);
}

export function isBookCompleted(book: Book): boolean {
	const totalPages = Math.max(1, book.totalPages);
	return book.currentPage >= totalPages;
}

export function canUpdateProgress(book: Book, newPage: number): boolean {
	const totalPages = Math.max(1, book.totalPages);
	return newPage >= 0 && newPage <= totalPages;
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
