<script lang="ts">
	import { BookOpen, Trash2 } from '@lucide/svelte';
	import { calculateProgressPercentage } from '$lib/domain/book/bookRules';
	import type { BookCardProps } from './library.types';

	let { book, onClick, onDelete }: BookCardProps = $props();

	const progress = $derived(calculateProgressPercentage(book));
	const isCompleted = $derived(book.isCompleted);
</script>

<article
	class="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
>
	<button class="flex flex-col gap-3 text-left" onclick={onClick}>
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
				<p class="text-sm text-muted-foreground">{book.author}</p>
				{#if isCompleted}
					<span
						class="mt-auto inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
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
			<div class="h-2 w-full rounded-full bg-muted">
				<div class="h-full rounded-full bg-primary transition-all" style="width: {progress}%"></div>
			</div>
		</div>
	</button>
	<button
		onclick={onDelete}
		class="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
		aria-label="Delete book"
	>
		<Trash2 class="h-4 w-4" />
	</button>
</article>
