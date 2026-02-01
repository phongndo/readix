<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Effect } from 'effect';
	import { PdfEngine } from '$lib/services/document/pdf-engine';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { createPositionTracker } from '$lib/features/reader/position-tracker';
	import type { PdfViewerProps } from '$lib/features/reader/reader.types';

	let { bookId, userId, fileUrl, totalPages }: PdfViewerProps = $props();

	// Engine instance
	let engine = $state<PdfEngine | null>(null);
	let container = $state<HTMLDivElement | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Position tracking
	let positionTracker = $state<ReturnType<typeof createPositionTracker> | null>(null);

	onMount(async () => {
		if (!browser || !fileUrl) return;

		try {
			// Initialize engine
			engine = new PdfEngine();
			readerStore.setIsLoading(true);
			readerStore.setBookId(bookId);
			readerStore.setFormat('pdf');
			readerStore.setTotalPages(totalPages);

			// Load PDF
			const handle = await Effect.runPromise(engine.load(fileUrl));
			readerStore.setTotalPages(handle.totalPages);

			// Initialize position tracker
			positionTracker = createPositionTracker(userId, bookId, 'pdf');

			// Load saved position
			const savedPosition = await Effect.runPromise(positionTracker.loadPosition());

			isLoading = false;
			readerStore.setIsLoading(false);

			// Render all pages (simpler than virtual scrolling for now)
			await renderAllPages(handle.totalPages);

			// Scroll to saved position after render
			if (savedPosition && container) {
				setTimeout(() => {
					if (container) {
						container.scrollTop = savedPosition.scrollOffset;
					}
				}, 100);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load PDF';
			readerStore.setError(error);
			isLoading = false;
			readerStore.setIsLoading(false);
		}
	});

	onDestroy(() => {
		// Save position before unmounting
		if (positionTracker && browser && container) {
			// Save current scroll position
			const scrollOffset = container.scrollTop;
			positionTracker.updateFromScroll(scrollOffset, []);
			Effect.runPromise(positionTracker.saveImmediately()).catch(console.error);
			positionTracker.cleanup();
		}

		// Cleanup engine
		if (engine) {
			engine.cleanup();
		}
	});

	async function renderAllPages(totalPages: number) {
		if (!engine || !container) return;

		const pageContainer = container.querySelector('.pages-container');
		if (!pageContainer) return;

		// Render all pages with proper centering
		for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
			const pageWrapper = document.createElement('div');
			pageWrapper.className = 'pdf-page-wrapper flex justify-center py-4';
			pageWrapper.dataset.page = String(pageNum);

			const pageDiv = document.createElement('div');
			pageDiv.className = 'pdf-page shadow-lg';
			pageWrapper.appendChild(pageDiv);
			pageContainer.appendChild(pageWrapper);

			// Render page
			try {
				await Effect.runPromise(engine!.renderPage(pageNum, pageDiv, readerStore.zoom));
			} catch (err) {
				console.error(`Failed to render page ${pageNum}:`, err);
			}
		}
	}

	function handleScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		const scrollOffset = target.scrollTop;
		// Debounced save (don't update store, just save to DB)
		if (positionTracker) {
			positionTracker.scheduleSaveFromScroll(scrollOffset);
		}
	}

	// Watch for zoom changes - re-render all pages
	$effect(() => {
		if (readerStore.zoom && engine && container) {
			const pageContainer = container.querySelector('.pages-container');
			if (pageContainer) {
				pageContainer.innerHTML = '';
				renderAllPages(readerStore.totalPages);
			}
		}
	});
</script>

{#if isLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
			></div>
			<p class="text-sm text-muted-foreground">Loading PDF...</p>
		</div>
	</div>
{:else if error}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<p class="text-red-500">{error}</p>
		</div>
	</div>
{:else}
	<!-- Scrollable content - clean, minimal UI -->
	<div bind:this={container} onscroll={handleScroll} class="h-screen overflow-y-auto bg-background">
		<div class="pages-container mx-auto max-w-5xl py-8">
			<!-- Pages rendered here -->
		</div>
	</div>
{/if}
