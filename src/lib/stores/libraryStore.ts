import { writable, derived } from 'svelte/store';
import type { Book } from '$lib/domain/book/Book';

type LibraryState = {
	books: Book[];
	isLoading: boolean;
	error: string | null;
};

function createLibraryStore() {
	const { subscribe, set, update } = writable<LibraryState>({
		books: [],
		isLoading: false,
		error: null
	});

	return {
		subscribe,
		setBooks: (books: Book[]) => update((s) => ({ ...s, books, isLoading: false, error: null })),
		setLoading: () => update((s) => ({ ...s, isLoading: true, error: null })),
		setError: (error: string) => update((s) => ({ ...s, isLoading: false, error })),
		addBook: (book: Book) => update((s) => ({ ...s, books: [...s.books, book] })),
		updateBook: (bookId: string, updates: Partial<Book>) =>
			update((s) => ({
				...s,
				books: s.books.map((b) => (b.id === bookId ? { ...b, ...updates } : b))
			})),
		removeBook: (bookId: string) =>
			update((s) => ({
				...s,
				books: s.books.filter((b) => b.id !== bookId)
			})),
		reset: () => set({ books: [], isLoading: false, error: null })
	};
}

export const libraryStore = createLibraryStore();

export const completedBooks = derived(libraryStore, ($library) =>
	$library.books.filter((b) => b.isCompleted)
);

export const inProgressBooks = derived(libraryStore, ($library) =>
	$library.books.filter((b) => !b.isCompleted)
);
