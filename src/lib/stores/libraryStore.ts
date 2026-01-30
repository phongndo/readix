import { writable, derived } from 'svelte/store';
import type { Book } from '$lib/domain/book/Book';
import { searchBooks } from '$lib/utils/fuzzySearch';

type FilterType = 'all' | 'in-progress' | 'completed';
type SortBy = 'updated' | 'title' | 'author' | 'progress';
type ViewMode = 'grid' | 'list';

type LibraryState = {
	books: Book[];
	isLoading: boolean;
	error: string | null;
	// Search and filter state
	searchQuery: string;
	activeFilter: FilterType;
	sortBy: SortBy;
	viewMode: ViewMode;
};

function createLibraryStore() {
	const { subscribe, set, update } = writable<LibraryState>({
		books: [],
		isLoading: false,
		error: null,
		searchQuery: '',
		activeFilter: 'all',
		sortBy: 'updated',
		viewMode: 'grid'
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
		// Search and filter actions
		setSearchQuery: (query: string) => update((s) => ({ ...s, searchQuery: query })),
		setActiveFilter: (filter: FilterType) => update((s) => ({ ...s, activeFilter: filter })),
		setSortBy: (sort: SortBy) => update((s) => ({ ...s, sortBy: sort })),
		setViewMode: (mode: ViewMode) => update((s) => ({ ...s, viewMode: mode })),
		reset: () =>
			set({
				books: [],
				isLoading: false,
				error: null,
				searchQuery: '',
				activeFilter: 'all',
				sortBy: 'updated',
				viewMode: 'grid'
			})
	};
}

export const libraryStore = createLibraryStore();

// Derived stores for filtering and sorting
export const filteredBooks = derived(libraryStore, ($library) => {
	let books = [...$library.books];

	// Apply search
	if ($library.searchQuery.trim()) {
		books = searchBooks(books, $library.searchQuery);
	}

	// Apply filter
	if ($library.activeFilter === 'in-progress') {
		books = books.filter((b) => !b.isCompleted);
	} else if ($library.activeFilter === 'completed') {
		books = books.filter((b) => b.isCompleted);
	}

	// Apply sort
	books.sort((a, b) => {
		switch ($library.sortBy) {
			case 'title':
				return a.title.localeCompare(b.title);
			case 'author':
				return a.author.localeCompare(b.author);
			case 'progress': {
				const progressA = a.currentPage / a.totalPages;
				const progressB = b.currentPage / b.totalPages;
				return progressB - progressA;
			}
			case 'updated':
			default:
				return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		}
	});

	return books;
});

export const completedBooks = derived(libraryStore, ($library) =>
	$library.books.filter((b) => b.isCompleted)
);

export const inProgressBooks = derived(libraryStore, ($library) =>
	$library.books.filter((b) => !b.isCompleted)
);

export const filterCounts = derived(libraryStore, ($library) => ({
	all: $library.books.length,
	inProgress: $library.books.filter((b) => !b.isCompleted).length,
	completed: $library.books.filter((b) => b.isCompleted).length
}));
