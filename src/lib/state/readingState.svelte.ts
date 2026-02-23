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

function createReadingState() {
	// eslint-disable-next-line prefer-const
	let state = $state<ReadingState>({
		currentBook: null,
		isReading: false,
		startTime: null,
		startPage: 0,
		currentPage: 0,
		sessionDuration: 0
	});

	let timerInterval: ReturnType<typeof setInterval> | null = null;

	// Derived values
	// eslint-disable-next-line prefer-const
	let readingProgress = $derived.by(() => {
		if (!state.currentBook) return 0;
		return calculateProgressPercentage({
			...state.currentBook,
			currentPage: state.currentPage
		});
	});

	// eslint-disable-next-line prefer-const
	let pagesReadThisSession = $derived(Math.max(0, state.currentPage - state.startPage));

	function startReading(book: Book, startPage?: number) {
		if (timerInterval) clearInterval(timerInterval);

		const initialPage = startPage ?? book.currentPage;
		const now = new Date();

		state.currentBook = book;
		state.isReading = true;
		state.startTime = now;
		state.startPage = initialPage;
		state.currentPage = initialPage;
		state.sessionDuration = 0;

		timerInterval = setInterval(() => {
			state.sessionDuration = state.sessionDuration + 1;
		}, 60000);
	}

	function updatePage(page: number) {
		state.currentPage = page;
	}

	function stopReading() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		state.isReading = false;
	}

	function reset() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		state.currentBook = null;
		state.isReading = false;
		state.startTime = null;
		state.startPage = 0;
		state.currentPage = 0;
		state.sessionDuration = 0;
	}

	function getSessionData() {
		if (!state.currentBook || !state.startTime) return null;

		const elapsedMinutes = Math.max(
			state.sessionDuration,
			Math.max(0, Math.floor((Date.now() - state.startTime.getTime()) / 60000))
		);

		return {
			bookId: state.currentBook.id,
			startPage: state.startPage,
			endPage: state.currentPage,
			durationMinutes: elapsedMinutes
		};
	}

	return {
		// State (readonly from outside)
		get state() {
			return state;
		},
		// Derived values
		get readingProgress() {
			return readingProgress;
		},
		get pagesReadThisSession() {
			return pagesReadThisSession;
		},
		// Actions
		startReading,
		updatePage,
		stopReading,
		reset,
		getSessionData
	};
}

export const readingState = createReadingState();
