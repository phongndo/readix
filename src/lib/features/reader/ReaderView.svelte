<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import Button from '$lib/components/atoms/button/button.svelte';
	import type { ReaderViewProps } from './reader.types';
	import { calculateProgressPercentage } from '$lib/domain/book/bookRules';

	let { book }: ReaderViewProps = $props();

	let currentPage = $derived(book.currentPage);

	const progress = $derived(calculateProgressPercentage({ ...book, currentPage }));
	const canGoPrevious = $derived(currentPage > 0);
	const canGoNext = $derived(currentPage < book.totalPages - 1);

	const contentChunks = $derived(book.content.split('\n\n'));
	const pages = $derived(
		contentChunks.length > 0
			? chunkArray(contentChunks, Math.ceil(contentChunks.length / book.totalPages))
			: [['No content available']]
	);
	const currentContent = $derived(pages[currentPage] || ['']);

	function chunkArray<T>(array: T[], chunkSize: number): T[][] {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		return chunks;
	}

	function goToPrevious() {
		if (canGoPrevious) {
			currentPage--;
			dispatchPageUpdate();
		}
	}

	function goToNext() {
		if (canGoNext) {
			currentPage++;
			dispatchPageUpdate();
		}
	}

	function dispatchPageUpdate() {
		const event = new CustomEvent('pagechange', {
			detail: { page: currentPage },
			bubbles: true
		});
		document.dispatchEvent(event);
	}

	function handleJumpToPage(e: Event) {
		const input = e.target as HTMLInputElement;
		const page = parseInt(input.value) - 1;
		if (page >= 0 && page < book.totalPages) {
			currentPage = page;
			dispatchPageUpdate();
		}
	}

	function handleExit() {
		const event = new CustomEvent('exitreader', {
			bubbles: true
		});
		document.dispatchEvent(event);
	}
</script>

<div class="flex h-screen flex-col bg-background">
	<!-- Header -->
	<header class="flex items-center justify-between border-b px-4 py-3">
		<div class="flex items-center gap-3">
			<Button variant="ghost" size="sm" onclick={handleExit}>
				<ChevronLeft class="mr-1 h-4 w-4" />
				Back
			</Button>
			<div>
				<h1 class="font-semibold leading-tight">{book.title}</h1>
				<p class="text-xs text-muted-foreground">{book.author}</p>
			</div>
		</div>
		<div class="flex items-center gap-4 text-sm text-muted-foreground">
			<span>Page {currentPage + 1} of {book.totalPages}</span>
		</div>
	</header>

	<!-- Progress bar -->
	<div class="h-1 w-full bg-muted">
		<div class="h-full bg-primary transition-all duration-300" style="width: {progress}%"></div>
	</div>

	<!-- Reading area -->
	<main class="flex-1 overflow-y-auto p-6 md:p-8">
		<article class="mx-auto max-w-2xl leading-relaxed">
			{#each currentContent as paragraph, index (index)}
				<p class="mb-4 text-lg">{paragraph}</p>
			{/each}
		</article>
	</main>

	<!-- Footer controls -->
	<footer class="border-t px-4 py-3">
		<div class="mx-auto flex max-w-2xl items-center justify-between gap-4">
			<Button variant="outline" size="sm" disabled={!canGoPrevious} onclick={goToPrevious}>
				<ChevronLeft class="mr-1 h-4 w-4" />
				Previous
			</Button>

			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Go to page:</span>
				<input
					type="number"
					min="1"
					max={book.totalPages}
					value={currentPage + 1}
					onchange={handleJumpToPage}
					class="w-16 rounded-md border bg-background px-2 py-1 text-center text-sm"
				/>
			</div>

			<Button variant="outline" size="sm" disabled={!canGoNext} onclick={goToNext}>
				Next
				<ChevronRight class="ml-1 h-4 w-4" />
			</Button>
		</div>
	</footer>
</div>
