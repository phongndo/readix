<script lang="ts" module>
	import { BookOpen, Trash2 } from '@lucide/svelte';
	import { calculateProgressPercentage } from '$lib/domain/book/bookRules';
	import type { Book } from '$lib/domain/book/Book';
	import ProgressBar from '$lib/components/atoms/progress-bar/progress-bar.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';

	export interface BookListItemProps {
		book: Book;
		onRead?: () => void;
		onDelete?: () => void;
		class?: string;
	}
</script>

<script lang="ts">
	let { book, onRead, onDelete, class: className }: BookListItemProps = $props();

	const progress = $derived(calculateProgressPercentage(book));
	const isCompleted = $derived(book.isCompleted);
</script>

<div
	class="group flex items-center justify-between gap-4 rounded-md border bg-background px-4 py-3 hover:bg-accent/50 {className}"
>
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<div class="flex flex-col gap-0.5 overflow-hidden">
			<h3 class="truncate font-medium">{book.title}</h3>
			<p class="truncate text-sm text-muted-foreground">
				{book.author || 'Unknown Author'}
			</p>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<div class="flex w-32 flex-col gap-1">
			<div class="flex justify-between text-xs text-muted-foreground">
				<span>{progress}%</span>
				<span>{book.currentPage}/{book.totalPages}</span>
			</div>
			<ProgressBar value={progress} size="sm" />
		</div>

		{#if isCompleted}
			<span
				class="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"
			>
				Completed
			</span>
		{/if}

		<div class="flex items-center gap-1">
			{#if onRead}
				<Tooltip content="Continue reading" position="top">
					{#snippet children({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon-sm"
							onclick={onRead}
							aria-label="Read book"
						>
							<BookOpen class="h-4 w-4" />
						</Button>
					{/snippet}
				</Tooltip>
			{/if}

			{#if onDelete}
				<Tooltip content="Remove from library" position="top">
					{#snippet children({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon-sm"
							onclick={onDelete}
							class="hover:text-red-500"
							aria-label="Delete book"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					{/snippet}
				</Tooltip>
			{/if}
		</div>
	</div>
</div>
