<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import LibraryView from './LibraryView.svelte';
	import type { Book } from '$lib/domain/book/Book';
	import type { UploadFormData } from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import type { DeletePreview } from '$lib/services/bookService';
	import { libraryState } from '$lib/state/libraryState.svelte';

	let {
		books,
		isLoading,
		error,
		onUploadBook,
		onDeleteBook,
		onGetDeletePreview
	}: {
		books: Book[];
		isLoading: boolean;
		error: string | null;
		onUploadBook: (formData: UploadFormData) => Promise<void>;
		onDeleteBook: (book: Book) => Promise<void>;
		onGetDeletePreview: (bookId: string) => Promise<DeletePreview>;
	} = $props();
</script>

<Tooltip.Provider>
	<LibraryView
		{books}
		filteredBooks={libraryState.filteredBooks}
		{isLoading}
		{error}
		searchQuery={libraryState.state.searchQuery}
		activeFilter={libraryState.state.activeFilter}
		filterCounts={libraryState.filterCounts}
		sortBy={libraryState.state.sortBy}
		viewMode={libraryState.state.viewMode}
		{onUploadBook}
		{onDeleteBook}
		{onGetDeletePreview}
		onSearch={(query) => libraryState.setSearchQuery(query)}
		onFilterChange={(filter) => libraryState.setActiveFilter(filter)}
		onSortChange={(sortBy) => libraryState.setSortBy(sortBy)}
		onViewModeChange={(viewMode) => libraryState.setViewMode(viewMode)}
		userId="user-1"
	/>
</Tooltip.Provider>
