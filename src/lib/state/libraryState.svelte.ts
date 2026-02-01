import type { Book } from '$lib/domain/book/Book';
import { searchBooks } from '$lib/search/fuzzySearch';

type FilterType = 'all' | 'in-progress' | 'completed';
type SortBy = 'updated' | 'title' | 'author' | 'progress';
type ViewMode = 'grid' | 'list';

type LibraryState = {
	books: Book[];
	isLoading: boolean;
	error: string | null;
	searchQuery: string;
	activeFilter: FilterType;
	sortBy: SortBy;
	viewMode: ViewMode;
};

function createLibraryState() {
	// eslint-disable-next-line prefer-const
	let state = $state<LibraryState>({
		books: [],
		isLoading: false,
		error: null,
		searchQuery: '',
		activeFilter: 'all',
		sortBy: 'updated',
		viewMode: 'grid'
	});

	// Derived values computed reactively
	// eslint-disable-next-line prefer-const
	let filteredBooks = $derived.by(() => {
		let books = [...state.books];

		// Apply search
		if (state.searchQuery.trim()) {
			books = searchBooks(books, state.searchQuery);
		}

		// Apply filter
		if (state.activeFilter === 'in-progress') {
			books = books.filter((b) => !b.isCompleted);
		} else if (state.activeFilter === 'completed') {
			books = books.filter((b) => b.isCompleted);
		}

		// Apply sort
		books.sort((a, b) => {
			switch (state.sortBy) {
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

	// eslint-disable-next-line prefer-const
	let completedBooks = $derived(state.books.filter((b) => b.isCompleted));
	// eslint-disable-next-line prefer-const
	let inProgressBooks = $derived(state.books.filter((b) => !b.isCompleted));
	// eslint-disable-next-line prefer-const
	let filterCounts = $derived({
		all: state.books.length,
		inProgress: state.books.filter((b) => !b.isCompleted).length,
		completed: state.books.filter((b) => b.isCompleted).length
	});

	// Actions
	function setBooks(books: Book[]) {
		state.books = books;
		state.isLoading = false;
		state.error = null;
	}

	function setLoading() {
		state.isLoading = true;
		state.error = null;
	}

	function setError(error: string) {
		state.isLoading = false;
		state.error = error;
	}

	function addBook(book: Book) {
		state.books = [...state.books, book];
	}

	function updateBook(bookId: string, updates: Partial<Book>) {
		state.books = state.books.map((b) => (b.id === bookId ? { ...b, ...updates } : b));
	}

	function removeBook(bookId: string) {
		state.books = state.books.filter((b) => b.id !== bookId);
	}

	function setSearchQuery(query: string) {
		state.searchQuery = query;
	}

	function setActiveFilter(filter: FilterType) {
		state.activeFilter = filter;
	}

	function setSortBy(sort: SortBy) {
		state.sortBy = sort;
	}

	function setViewMode(mode: ViewMode) {
		state.viewMode = mode;
	}

	function reset() {
		state.books = [];
		state.isLoading = false;
		state.error = null;
		state.searchQuery = '';
		state.activeFilter = 'all';
		state.sortBy = 'updated';
		state.viewMode = 'grid';
	}

	return {
		// State (readonly from outside)
		get state() {
			return state;
		},
		// Derived values
		get filteredBooks() {
			return filteredBooks;
		},
		get completedBooks() {
			return completedBooks;
		},
		get inProgressBooks() {
			return inProgressBooks;
		},
		get filterCounts() {
			return filterCounts;
		},
		// Actions
		setBooks,
		setLoading,
		setError,
		addBook,
		updateBook,
		removeBook,
		setSearchQuery,
		setActiveFilter,
		setSortBy,
		setViewMode,
		reset
	};
}

export const libraryState = createLibraryState();
