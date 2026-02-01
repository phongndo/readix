<script lang="ts" module>
	import { BookOpen, Trash2 } from '@lucide/svelte';
	import { calculateProgressPercentage } from '$lib/domain/book/bookRules';
	import type { Book } from '$lib/domain/book/Book';
	import CardContainer from '$lib/components/atoms/card-container/card-container.svelte';
	import ProgressBar from '$lib/components/atoms/progress-bar/progress-bar.svelte';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';

	export interface BookCardProps {
		book: Book;
		onClick?: () => void;
		onDelete?: () => void;
		class?: string;
	}
</script>

<script lang="ts">
	let { book, onClick, onDelete, class: className }: BookCardProps = $props();

	const progress = $derived(calculateProgressPercentage(book));
	const isCompleted = $derived(book.isCompleted);
</script>

<CardContainer
	variant="interactive"
	padding="md"
	class="group relative flex flex-col gap-3 {className}"
	onclick={onClick}
>
	<div class="flex items-start justify-between gap-2">
		{#if book.coverUrl}
			<img
				src={book.coverUrl}
				alt={book.title}
				class="h-32 w-24 flex-shrink-0 rounded-md object-cover"
			/>
		{:else}
			<div class="flex h-32 w-24 flex-shrink-0 items-center justify-center rounded-md bg-muted">
				<BookOpen class="h-8 w-8 text-muted-foreground" />
			</div>
		{/if}
		<div class="flex flex-1 flex-col gap-1">
			<h3 class="line-clamp-2 font-semibold leading-tight">{book.title}</h3>
			{#if book.author && book.author !== 'Unknown Author'}
				<p class="text-sm text-muted-foreground">{book.author}</p>
			{/if}
			{#if isCompleted}
				<span
					class="mt-auto inline-flex w-fit items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"
				>
					Completed
				</span>
			{/if}
		</div>
	</div>
	<div class="space-y-1">
		<div class="flex justify-between text-xs text-muted-foreground">
			<span>{book.currentPage} / {book.totalPages} pages</span>
			<span>{progress}%</span>
		</div>
		<ProgressBar value={progress} size="sm" />
	</div>

	{#if onDelete}
		<Tooltip content="Remove from library" position="top">
			<button
				onclick={(e) => {
					e.stopPropagation();
					onDelete?.();
				}}
				class="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
				aria-label="Delete book"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		</Tooltip>
	{/if}
</CardContainer>
