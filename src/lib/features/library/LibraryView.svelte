<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import BookGrid from '$lib/components/organisms/book-grid/book-grid.svelte';
	import LibraryToolbar from '$lib/components/organisms/library-toolbar/library-toolbar.svelte';
	import UploadModal from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import EmptySearchState from '$lib/components/molecules/empty-search-state/empty-search-state.svelte';
	import type { Book } from '$lib/domain/book/Book';
	import { libraryState } from '$lib/state/libraryState.svelte';

	let {
		books = [],
		isLoading = false,
		error = null
	} = $props<{
		books?: Book[];
		isLoading?: boolean;
		error?: string | null;
	}>();

	let showUploadModal = $state(false);

	$effect(() => {
		if (books.length > 0) {
			libraryState.setBooks(books);
		}
	});

	function handleBookClick(book: Book) {
		// TODO: Track selected book state when reader navigation is implemented
		// Navigate to reader
		window.location.href = `/reader/${book.id}`;
	}

	function handleDeleteBook(book: Book) {
		if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
			dispatchDelete(book.id);
		}
	}

	function dispatchDelete(bookId: string) {
		const event = new CustomEvent('deletebook', {
			detail: { bookId },
			bubbles: true
		});
		document.dispatchEvent(event);
	}

	function handleAddBook() {
		showUploadModal = true;
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Your Library</h1>
			<p class="text-sm text-muted-foreground">
				{libraryState.filterCounts.all} book{libraryState.filterCounts.all === 1 ? '' : 's'}
			</p>
		</div>
		<Button onclick={handleAddBook}>
			<Plus class="mr-2 h-4 w-4" />
			Add Book
		</Button>
	</div>

	<!-- Toolbar with search, filters, and sort -->
	<LibraryToolbar
		bind:searchQuery={libraryState.state.searchQuery}
		resultCount={libraryState.filteredBooks.length}
		activeFilter={libraryState.state.activeFilter}
		filterCounts={libraryState.filterCounts}
		sortBy={libraryState.state.sortBy}
		viewMode={libraryState.state.viewMode}
		onSearch={(q) => libraryState.setSearchQuery(q)}
		onFilterChange={(f) => libraryState.setActiveFilter(f)}
		onSortChange={(s) => libraryState.setSortBy(s)}
		onViewModeChange={(m) => libraryState.setViewMode(m)}
	/>

	<!-- Book grid or empty state -->
	{#if libraryState.state.searchQuery && libraryState.filteredBooks.length === 0}
		<EmptySearchState
			searchQuery={libraryState.state.searchQuery}
			onClear={() => libraryState.setSearchQuery('')}
		/>
	{:else}
		<BookGrid
			books={libraryState.filteredBooks}
			{isLoading}
			{error}
			onBookClick={handleBookClick}
			onBookDelete={handleDeleteBook}
		/>
	{/if}
</div>

<UploadModal bind:open={showUploadModal} />
