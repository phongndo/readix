import type Fuse from 'fuse.js';
import type { SearchResult } from '$lib/features/reader/reader.types';
import type { Bookmark, Annotation } from '$lib/domain/reading/ReadingPosition';

interface SearchIndexEntry {
	page: number;
	text: string;
	wordCount: number;
}

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
	let sidebarPosition = $state<'left' | 'right'>('right');

	// Data
	let bookmarks = $state<Bookmark[]>([]);
	let annotations = $state<Annotation[]>([]);

	// Search
	let searchQuery = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let activeSearchResultIndex = $state(-1);
	let isSearching = $state(false);
	let searchIndex = $state<Fuse<SearchIndexEntry> | null>(null);
	let searchIndexEntries = $state<SearchIndexEntry[]>([]);

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
		get sidebarPosition() {
			return sidebarPosition;
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
		get activeSearchResultIndex() {
			return activeSearchResultIndex;
		},
		get activeSearchResult() {
			if (activeSearchResultIndex < 0 || activeSearchResultIndex >= searchResults.length) {
				return null;
			}
			return searchResults[activeSearchResultIndex];
		},
		get isSearching() {
			return isSearching;
		},
		get searchIndex() {
			return searchIndex;
		},
		get searchIndexEntries() {
			return searchIndexEntries;
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
		setSidebarPosition: (position: 'left' | 'right') => {
			sidebarPosition = position;
		},
		setBookmarks: (b: Bookmark[]) => {
			bookmarks = b;
		},
		setAnnotations: (a: Annotation[]) => {
			annotations = a;
		},
		deleteBookmark: (bookmarkId: string) => {
			bookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
		},
		removeBookmark: (bookmarkId: string) => {
			bookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
		},
		setSearchQuery: (query: string) => {
			searchQuery = query;
			activeSearchResultIndex = -1;
		},
		setSearchResults: (results: SearchResult[]) => {
			searchResults = results;
			activeSearchResultIndex = results.length > 0 ? 0 : -1;
		},
		setActiveSearchResultIndex: (index: number) => {
			if (searchResults.length === 0) {
				activeSearchResultIndex = -1;
				return;
			}
			activeSearchResultIndex = Math.max(0, Math.min(index, searchResults.length - 1));
		},
		setIsSearching: (searching: boolean) => {
			isSearching = searching;
		},
		setSearchIndex: (index: Fuse<SearchIndexEntry> | null) => {
			searchIndex = index;
		},
		setSearchIndexEntries: (entries: SearchIndexEntry[]) => {
			searchIndexEntries = entries;
		},
		addSearchIndexEntry: (entry: SearchIndexEntry) => {
			searchIndexEntries = [...searchIndexEntries, entry];
		},
		nextSearchResult: () => {
			if (searchResults.length === 0) return null;
			if (activeSearchResultIndex < 0) {
				activeSearchResultIndex = 0;
			} else {
				activeSearchResultIndex = (activeSearchResultIndex + 1) % searchResults.length;
			}
			return searchResults[activeSearchResultIndex];
		},
		previousSearchResult: () => {
			if (searchResults.length === 0) return null;
			if (activeSearchResultIndex < 0) {
				activeSearchResultIndex = 0;
			} else {
				activeSearchResultIndex =
					(activeSearchResultIndex - 1 + searchResults.length) % searchResults.length;
			}
			return searchResults[activeSearchResultIndex];
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

		// Bookmark actions
		loadBookmarks: (bookmarksData: Bookmark[]) => {
			bookmarks = bookmarksData;
		},
		addBookmark: (bookmark: Bookmark) => {
			bookmarks = [...bookmarks, bookmark].sort((a, b) => a.page - b.page);
		},

		// Annotation actions
		loadAnnotations: (annotationsData: Annotation[]) => {
			annotations = annotationsData;
		},
		addAnnotation: (annotation: Annotation) => {
			annotations = [...annotations, annotation];
		},
		removeAnnotation: (annotationId: string) => {
			annotations = annotations.filter((a) => a.id !== annotationId);
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
			sidebarPosition = 'right';
			bookmarks = [];
			annotations = [];
			searchQuery = '';
			searchResults = [];
			activeSearchResultIndex = -1;
			isSearching = false;
			searchIndex = null;
			searchIndexEntries = [];
		}
	};
}

export const readerStore = createReaderStore();
