<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import BookListItem from '$lib/components/molecules/book-list-item/book-list-item.svelte';
	import BookGrid from '$lib/components/organisms/book-grid/book-grid.svelte';
	import LibraryToolbar from '$lib/components/organisms/library-toolbar/library-toolbar.svelte';
	import EmptySearchState from '$lib/components/molecules/empty-search-state/empty-search-state.svelte';
	import UploadModal, {
		type UploadFormData
	} from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import DeleteBookDialog from '$lib/features/library/DeleteBookDialog.svelte';
	import type { DeletePreview } from '$lib/services/bookService';
	import type { Book } from '$lib/domain/book/Book';

	let {
		books = [],
		filteredBooks = [],
		isLoading = false,
		error = null,
		searchQuery = '',
		activeFilter = 'all',
		filterCounts,
		sortBy = 'updated',
		viewMode = 'grid',
		onUploadBook,
		onDeleteBook,
		onGetDeletePreview,
		onSearch,
		onFilterChange,
		onSortChange,
		onViewModeChange,
		userId
	} = $props<{
		books?: Book[];
		filteredBooks?: Book[];
		isLoading?: boolean;
		error?: string | null;
		searchQuery?: string;
		activeFilter?: 'all' | 'in-progress' | 'completed';
		filterCounts: {
			all: number;
			inProgress: number;
			completed: number;
		};
		sortBy?: 'updated' | 'title' | 'author' | 'progress';
		viewMode?: 'grid' | 'list';
		onUploadBook: (formData: UploadFormData) => Promise<void>;
		onDeleteBook: (book: Book) => Promise<void>;
		onGetDeletePreview: (bookId: string) => Promise<DeletePreview>;
		onSearch: (query: string) => void;
		onFilterChange: (filter: 'all' | 'in-progress' | 'completed') => void;
		onSortChange: (sort: 'updated' | 'title' | 'author' | 'progress') => void;
		onViewModeChange: (mode: 'grid' | 'list') => void;
		userId?: string;
	}>();

	let showUploadModal = $state(false);
	let showDeleteDialog = $state(false);
	let bookPendingDelete = $state<Book | null>(null);
	let deletePreview = $state<DeletePreview | null>(null);
	let deleteDialogError = $state<string | null>(null);
	let isPreviewLoading = $state(false);
	let isDeleting = $state(false);
	const totalBooks = $derived(filterCounts.all > 0 ? filterCounts.all : books.length);

	function handleBookClick(book: Book) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/reader/${book.id}`);
	}

	function handleAddBook() {
		showUploadModal = true;
	}

	async function handleUploadSubmit(formData: UploadFormData) {
		await onUploadBook(formData);
	}

	async function handleDeleteRequest(book: Book) {
		bookPendingDelete = book;
		showDeleteDialog = true;
		deletePreview = null;
		deleteDialogError = null;
		isPreviewLoading = true;

		try {
			deletePreview = await onGetDeletePreview(book.id);
		} catch (previewError) {
			deleteDialogError =
				previewError instanceof Error ? previewError.message : 'Failed to load delete preview';
		} finally {
			isPreviewLoading = false;
		}
	}

	function closeDeleteDialog() {
		showDeleteDialog = false;
		bookPendingDelete = null;
		deletePreview = null;
		deleteDialogError = null;
		isPreviewLoading = false;
	}

	async function confirmDeleteBook() {
		if (!bookPendingDelete) return;

		isDeleting = true;
		deleteDialogError = null;
		try {
			await onDeleteBook(bookPendingDelete);
			closeDeleteDialog();
		} catch (deleteError) {
			deleteDialogError =
				deleteError instanceof Error ? deleteError.message : 'Failed to delete book';
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Your Library</h1>
			<p class="text-sm text-muted-foreground">
				{totalBooks} book{totalBooks === 1 ? '' : 's'}
			</p>
		</div>
		<Button onclick={handleAddBook}>
			<Plus class="mr-2 h-4 w-4" />
			Add Book
		</Button>
	</div>

	<div class="grid gap-3 sm:grid-cols-3">
		<div class="rounded-md border bg-card px-4 py-3">
			<p class="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
			<p class="text-xl font-semibold">{filterCounts.all}</p>
		</div>
		<div class="rounded-md border bg-card px-4 py-3">
			<p class="text-xs uppercase tracking-wide text-muted-foreground">In Progress</p>
			<p class="text-xl font-semibold">{filterCounts.inProgress}</p>
		</div>
		<div class="rounded-md border bg-card px-4 py-3">
			<p class="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
			<p class="text-xl font-semibold">{filterCounts.completed}</p>
		</div>
	</div>

	<!-- Toolbar with search, filters, and sort -->
	<LibraryToolbar
		{searchQuery}
		resultCount={filteredBooks.length}
		{activeFilter}
		{filterCounts}
		{sortBy}
		{viewMode}
		{onSearch}
		{onFilterChange}
		{onSortChange}
		{onViewModeChange}
	/>

	<!-- Book grid or empty state -->
	{#if searchQuery && filteredBooks.length === 0}
		<EmptySearchState {searchQuery} onClear={() => onSearch('')} />
	{:else if filteredBooks.length === 0}
		<BookGrid books={[]} {isLoading} {error} onBookClick={undefined} onBookDelete={undefined} />
	{:else if viewMode === 'grid'}
		<BookGrid
			books={filteredBooks}
			{isLoading}
			{error}
			onBookClick={handleBookClick}
			onBookDelete={handleDeleteRequest}
		/>
	{:else}
		<div class="space-y-2">
			{#each filteredBooks as book (book.id)}
				<BookListItem
					{book}
					onRead={() => handleBookClick(book)}
					onDelete={() => handleDeleteRequest(book)}
				/>
			{/each}
		</div>
	{/if}
</div>

<UploadModal bind:open={showUploadModal} {userId} onSubmit={handleUploadSubmit} />

{#if showDeleteDialog && bookPendingDelete}
	<DeleteBookDialog
		bind:open={showDeleteDialog}
		bookTitle={bookPendingDelete.title}
		preview={deletePreview}
		previewError={deleteDialogError}
		isLoading={isPreviewLoading}
		{isDeleting}
		onCancel={closeDeleteDialog}
		onConfirm={confirmDeleteBook}
	/>
{/if}
