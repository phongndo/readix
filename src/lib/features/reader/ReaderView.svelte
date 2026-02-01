<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';
	import PdfViewer from '$lib/features/reader/components/pdf-viewer/pdf-viewer.svelte';
	import { page } from '$app/state';
	import type { ReaderViewProps } from './reader.types';
	import { calculateProgressPercentage } from '$lib/domain/book/bookRules';

	let { book }: ReaderViewProps = $props();

	// Determine if this is a PDF file or text content
	const hasFile = $derived(book.fileStorageId != null);
	const fileUrl = $derived(hasFile ? `/api/files/${book.fileStorageId}` : null);

	let currentPage = $derived(book.currentPage);

	const progress = $derived(calculateProgressPercentage({ ...book, currentPage }));

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
			<Tooltip content="Back to library (Esc)" position="bottom">
				{#snippet children({ props })}
					<Button {...props} variant="ghost" size="sm" onclick={handleExit}>
						<ChevronLeft class="mr-1 h-4 w-4" />
						Back
					</Button>
				{/snippet}
			</Tooltip>
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
	<main class="flex-1 overflow-hidden">
		{#if hasFile && fileUrl && page.data.userId}
			<PdfViewer
				bookId={book.id}
				userId={page.data.userId}
				title={book.title}
				author={book.author}
				{fileUrl}
				totalPages={book.totalPages}
			/>
		{:else}
			<div class="h-full overflow-y-auto p-6 md:p-8">
				<article class="mx-auto max-w-2xl leading-relaxed">
					{#each currentContent as paragraph, index (index)}
						<p class="mb-4 text-lg">{paragraph}</p>
					{/each}
				</article>
			</div>
		{/if}
	</main>
</div>
