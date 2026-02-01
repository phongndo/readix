<script lang="ts">
	import { BookOpen, ChevronRight } from '@lucide/svelte';
	import type { Book } from '$lib/domain/book/Book';
	import { calculateProgressPercentage } from '$lib/domain/book/bookRules';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';

	let { books = [] }: { books: Book[] } = $props();

	function getProgress(book: Book): number {
		return calculateProgressPercentage(book);
	}

	function goToLibrary() {
		goto(resolve('/library'));
	}

	function goToReader(bookId: string) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/reader/${bookId}`);
	}
</script>

<div class="rounded-lg border bg-card p-6">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-lg font-semibold">Recently Read</h3>
		{#if books.length > 0}
			<Button
				variant="ghost"
				size="sm"
				onclick={goToLibrary}
				class="flex items-center text-sm text-muted-foreground hover:text-primary"
			>
				View All
				<ChevronRight class="h-4 w-4" />
			</Button>
		{/if}
	</div>

	{#if books.length === 0}
		<p class="text-sm text-muted-foreground">No books yet. Start reading to see them here!</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each books.slice(0, 6) as book (book.id)}
				<button
					onclick={() => goToReader(book.id)}
					class="group flex items-start gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent/50"
				>
					{#if book.coverUrl}
						<img src={book.coverUrl} alt={book.title} class="h-16 w-12 rounded-sm object-cover" />
					{:else}
						<div class="flex h-16 w-12 items-center justify-center rounded-sm bg-muted">
							<BookOpen class="h-6 w-6 text-muted-foreground" />
						</div>
					{/if}

					<div class="flex-1 min-w-0">
						<p class="truncate font-medium group-hover:text-primary">{book.title}</p>
						<p class="truncate text-xs text-muted-foreground">{book.author}</p>
						<div class="mt-2">
							<div class="h-1.5 w-full rounded-full bg-muted">
								<div
									class="h-full rounded-full bg-primary transition-all"
									style="width: {getProgress(book)}%"
								></div>
							</div>
							<p class="mt-1 text-xs text-muted-foreground">
								{book.currentPage} / {book.totalPages} pages
							</p>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
