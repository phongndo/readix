import { writable, derived } from 'svelte/store';
import type { Book } from '$lib/domain/book/Book';
import { calculateProgressPercentage } from '$lib/domain/book/bookRules';

type ReadingState = {
	currentBook: Book | null;
	isReading: boolean;
	startTime: Date | null;
	startPage: number;
	currentPage: number;
	sessionDuration: number;
};

function createReadingStore() {
	const { subscribe, set, update } = writable<ReadingState>({
		currentBook: null,
		isReading: false,
		startTime: null,
		startPage: 0,
		currentPage: 0,
		sessionDuration: 0
	});

	let timerInterval: ReturnType<typeof setInterval> | null = null;

	return {
		subscribe,
		startReading: (book: Book, startPage?: number) => {
			if (timerInterval) clearInterval(timerInterval);

			const initialPage = startPage ?? book.currentPage;
			const now = new Date();

			set({
				currentBook: book,
				isReading: true,
				startTime: now,
				startPage: initialPage,
				currentPage: initialPage,
				sessionDuration: 0
			});

			timerInterval = setInterval(() => {
				update((s) => ({
					...s,
					sessionDuration: s.sessionDuration + 1
				}));
			}, 60000);
		},
		updatePage: (page: number) => {
			update((s) => ({ ...s, currentPage: page }));
		},
		stopReading: () => {
			if (timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
			}
			update((s) => ({ ...s, isReading: false }));
		},
		reset: () => {
			if (timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
			}
			set({
				currentBook: null,
				isReading: false,
				startTime: null,
				startPage: 0,
				currentPage: 0,
				sessionDuration: 0
			});
		},
		getSessionData: () => {
			let state: ReadingState | undefined;
			subscribe((s) => {
				state = s;
			})();
			if (!state?.currentBook || !state.startTime) return null;

			return {
				bookId: state.currentBook.id,
				startPage: state.startPage,
				endPage: state.currentPage,
				durationMinutes: state.sessionDuration
			};
		}
	};
}

export const readingStore = createReadingStore();

export const readingProgress = derived(readingStore, ($reading) => {
	if (!$reading.currentBook) return 0;
	return calculateProgressPercentage({
		...$reading.currentBook,
		currentPage: $reading.currentPage
	});
});

export const pagesReadThisSession = derived(readingStore, ($reading) =>
	Math.max(0, $reading.currentPage - $reading.startPage)
);
