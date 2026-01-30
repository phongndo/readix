<script lang="ts">
	import { Plus, Loader2 } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import BookCard from './BookCard.svelte';
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

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if error}
		<div
			class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive"
		>
			{error}
		</div>
	{:else if books.length === 0}
		<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<div class="rounded-full bg-muted p-4">
				<span class="text-4xl">📚</span>
			</div>
			<div>
				<h3 class="font-semibold">No books yet</h3>
				<p class="text-sm text-muted-foreground">Add your first book to start reading</p>
			</div>
			<Button onclick={handleAddBook}>
				<Plus class="mr-2 h-4 w-4" />
				Add Book
			</Button>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each books as book (book.id)}
				<BookCard
					{book}
					onClick={() => handleBookClick(book)}
					onDelete={() => handleDeleteBook(book)}
				/>
			{/each}
		</div>
	{/if}
</div>

<AddBookModal bind:open={showAddModal} />

{#if selectedBook}
	<!-- Navigate to reader -->
{/if}
