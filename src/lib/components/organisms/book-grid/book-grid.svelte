<script lang="ts" module>
	import type { Component } from 'svelte';
	import type { Book } from '$lib/domain/book/Book';
	import { cn } from '$lib/utils.js';

	export interface BookGridProps {
		books: Book[];
		isLoading?: boolean;
		error?: string | null;
		onAddBook?: () => void;
		onBookClick?: (book: Book) => void;
		onBookDelete?: (book: Book) => void;
		emptyState?: {
			icon?: Component;
			title: string;
			description: string;
		};
		class?: string;
	}
</script>

<script lang="ts">
	import { Loader2, Plus } from '@lucide/svelte';
	import Button from '$lib/components/atoms/button/button.svelte';
	import BookCard from '$lib/components/organisms/book-card/book-card.svelte';

	let {
		books,
		isLoading = false,
		error = '',
		onAddBook,
		onBookClick,
		onBookDelete,
		emptyState = {
			title: 'No books yet',
			description: 'Add your first book to start reading'
		},
		class: className
	}: BookGridProps = $props();
</script>

<div class={cn('flex flex-col gap-6', className)}>
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if error}
		<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-red-500">
			{error}
		</div>
	{:else if books.length === 0}
		<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<div class="rounded-full bg-muted p-4">
				<span class="text-4xl">📚</span>
			</div>
			<div>
				<h3 class="font-semibold">{emptyState.title}</h3>
				<p class="text-sm text-muted-foreground">{emptyState.description}</p>
			</div>
			{#if onAddBook}
				<Button onclick={onAddBook}>
					<Plus class="mr-2 h-4 w-4" />
					Add Book
				</Button>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each books as book (book.id)}
				<BookCard
					{book}
					onClick={onBookClick ? () => onBookClick(book) : undefined}
					onDelete={onBookDelete ? () => onBookDelete(book) : undefined}
				/>
			{/each}
		</div>
	{/if}
</div>
