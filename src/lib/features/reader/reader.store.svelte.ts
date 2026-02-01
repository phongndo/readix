import type { SearchResult } from '$lib/features/reader/reader.types';
import type { Bookmark, Annotation } from '$lib/domain/reading/ReadingPosition';

/**
 * Reader state management using Svelte 5 runes
 * Centralizes all reader-related state
 */
function createReaderStore() {
	// Document state
	let bookId = $state('');
	let format = $state<'pdf' | 'epub' | 'text'>('pdf');
	let totalPages = $state(0);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Reading position
	let currentPage = $state(1);
	let scrollOffset = $state(0);
	let isRestoringPosition = $state(false);

	// View state
	let zoom = $state(1.0);
	let isToolbarVisible = $state(true);
	let isSidebarOpen = $state(false);
	let sidebarTab = $state<'bookmarks' | 'annotations' | 'search'>('bookmarks');

	// Data
	let bookmarks = $state<Bookmark[]>([]);
	let annotations = $state<Annotation[]>([]);

	// Search
	let searchQuery = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let isSearching = $state(false);

	return {
		// Getters
		get bookId() {
			return bookId;
		},
		get format() {
			return format;
		},
		get totalPages() {
			return totalPages;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get currentPage() {
			return currentPage;
		},
		get scrollOffset() {
			return scrollOffset;
		},
		get isRestoringPosition() {
			return isRestoringPosition;
		},
		get zoom() {
			return zoom;
		},
		get isToolbarVisible() {
			return isToolbarVisible;
		},
		get isSidebarOpen() {
			return isSidebarOpen;
		},
		get sidebarTab() {
			return sidebarTab;
		},
		get bookmarks() {
			return bookmarks;
		},
		get annotations() {
			return annotations;
		},
		get searchQuery() {
			return searchQuery;
		},
		get searchResults() {
			return searchResults;
		},
		get isSearching() {
			return isSearching;
		},

		// Setters
		setBookId: (id: string) => {
			bookId = id;
		},
		setFormat: (f: 'pdf' | 'epub' | 'text') => {
			format = f;
		},
		setTotalPages: (pages: number) => {
			totalPages = pages;
		},
		setIsLoading: (loading: boolean) => {
			isLoading = loading;
		},
		setError: (err: string | null) => {
			error = err;
		},
		setCurrentPage: (page: number) => {
			currentPage = Math.max(1, Math.min(page, totalPages || page));
		},
		setScrollOffset: (offset: number) => {
			scrollOffset = offset;
		},
		setIsRestoringPosition: (restoring: boolean) => {
			isRestoringPosition = restoring;
		},
		setZoom: (z: number) => {
			zoom = Math.max(0.25, Math.min(3.0, z));
		},
		setToolbarVisible: (visible: boolean) => {
			isToolbarVisible = visible;
		},
		toggleSidebar: () => {
			isSidebarOpen = !isSidebarOpen;
		},
		setSidebarTab: (tab: 'bookmarks' | 'annotations' | 'search') => {
			sidebarTab = tab;
		},
		setBookmarks: (b: Bookmark[]) => {
			bookmarks = b;
		},
		setAnnotations: (a: Annotation[]) => {
			annotations = a;
		},
		setSearchQuery: (query: string) => {
			searchQuery = query;
		},
		setSearchResults: (results: SearchResult[]) => {
			searchResults = results;
		},
		setIsSearching: (searching: boolean) => {
			isSearching = searching;
		},

		// Actions
		nextPage: () => {
			if (currentPage < totalPages) {
				currentPage++;
			}
		},
		previousPage: () => {
			if (currentPage > 1) {
				currentPage--;
			}
		},
		zoomIn: () => {
			zoom = Math.min(3.0, zoom + 0.25);
		},
		zoomOut: () => {
			zoom = Math.max(0.25, zoom - 0.25);
		},
		reset: () => {
			bookId = '';
			format = 'pdf';
			totalPages = 0;
			isLoading = false;
			error = null;
			currentPage = 1;
			scrollOffset = 0;
			isRestoringPosition = false;
			zoom = 1.0;
			isToolbarVisible = true;
			isSidebarOpen = false;
			sidebarTab = 'bookmarks';
			bookmarks = [];
			annotations = [];
			searchQuery = '';
			searchResults = [];
			isSearching = false;
		}
	};
}

export const readerStore = createReaderStore();
