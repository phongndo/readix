<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import Button from '$lib/components/atoms/button/button.svelte';
	import BookGrid from '$lib/components/organisms/book-grid/book-grid.svelte';
	import AddBookModal from './AddBookModal.svelte';
	import type { LibraryViewProps } from './library.types';
	import type { Book } from '$lib/domain/book/Book';

	let { books, isLoading, error }: LibraryViewProps = $props();

	let showAddModal = $state(false);
	let selectedBook = $state<Book | null>(null);

	function handleBookClick(book: Book) {
		selectedBook = book;
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
		showAddModal = true;
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Your Library</h1>
			<p class="text-sm text-muted-foreground">
				{books.length} book{books.length === 1 ? '' : 's'}
			</p>
		</div>
		<Button onclick={handleAddBook}>
			<Plus class="mr-2 h-4 w-4" />
			Add Book
		</Button>
	</div>

	<BookGrid
		{books}
		{isLoading}
		{error}
		onAddBook={handleAddBook}
		onBookClick={handleBookClick}
		onBookDelete={handleDeleteBook}
	/>
</div>

<AddBookModal bind:open={showAddModal} />

{#if selectedBook}
	<!-- Navigate to reader -->
{/if}
