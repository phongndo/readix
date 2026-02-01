import { convexClient } from '$lib/convex/client';
import { api } from '$lib/convex/api';
import { libraryState } from './libraryState.svelte';
import { convertConvexBooksToBooks } from '$lib/domain/book/convexBookAdapter';
import type { Book } from '$lib/domain/book/Book';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConvexBook = any;

/**
 * Convex library data store
 * Manual fetch only - no auto-polling to reduce overhead
 */
function createConvexLibraryStore() {
	let books = $state<Book[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let lastUpdateTime = $state<number>(Date.now());

	/**
	 * Check if book data has actually changed
	 */
	function hasDataChanged(newBooks: Book[], oldBooks: Book[]): boolean {
		if (newBooks.length !== oldBooks.length) return true;

		for (let i = 0; i < newBooks.length; i++) {
			const newBook = newBooks[i];
			const oldBook = oldBooks[i];

			if (!oldBook) return true;
			if (newBook.id !== oldBook.id) return true;
			if (newBook.updatedAt.getTime() !== oldBook.updatedAt.getTime()) return true;
			if (newBook.currentPage !== oldBook.currentPage) return true;
			if (newBook.isCompleted !== oldBook.isCompleted) return true;
		}

		return false;
	}

	/**
	 * Fetch books from Convex (one-time fetch, no polling)
	 */
	async function fetchBooks(userId: string): Promise<void> {
		if (!userId) return;

		try {
			isLoading = true;
			error = null;

			console.log('[ConvexLibraryStore] Fetching books for user:', userId);
			const result = await convexClient.query(api.books.getByUser, { userId });

			// Convert Convex books to Book domain type
			const convertedBooks = convertConvexBooksToBooks(result as ConvexBook[]);

			// Only update if data actually changed
			if (hasDataChanged(convertedBooks, books)) {
				console.log('[ConvexLibraryStore] Books updated, count:', convertedBooks.length);
				books = convertedBooks;
				lastUpdateTime = Date.now();

				// Sync with existing libraryState for compatibility
				libraryState.setBooks(convertedBooks);
			} else {
				console.log('[ConvexLibraryStore] No changes detected');
			}
		} catch (err) {
			console.error('[ConvexLibraryStore] Failed to fetch books:', err);
			error = err instanceof Error ? err.message : 'Failed to fetch books';
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Manual refresh - call this when user wants fresh data
	 */
	async function refresh(userId: string): Promise<void> {
		console.log('[ConvexLibraryStore] Manual refresh triggered');
		await fetchBooks(userId);
	}

	/**
	 * Clear all data
	 */
	function clear() {
		console.log('[ConvexLibraryStore] Clearing data');
		books = [];
		error = null;
		lastUpdateTime = Date.now();
	}

	/**
	 * Get last update timestamp
	 */
	function getLastUpdateTime() {
		return lastUpdateTime;
	}

	return {
		// Getters
		get books() {
			return books;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get hasData() {
			return books.length > 0;
		},

		// Actions
		fetchBooks,
		refresh,
		clear,
		getLastUpdateTime
	};
}

export const convexLibraryStore = createConvexLibraryStore();
