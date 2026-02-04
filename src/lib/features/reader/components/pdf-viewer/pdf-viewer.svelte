<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Effect, Option } from 'effect';
	import { PdfEngine } from '$lib/services/document/pdf-engine';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { createPositionTracker } from '$lib/features/reader/position-tracker';
	import {
		calculateScrollProgress,
		restoreScrollPosition
	} from '$lib/domain/reading/scrollPreservation';
	import { fetchBookmarks, lookupConvexUserId } from '$lib/services/bookmarkService';

	import HighlightLayer from '$lib/features/reader/components/highlight-layer/highlight-layer.svelte';
	import AnnotationToolbar from '$lib/features/reader/components/annotation-toolbar/annotation-toolbar.svelte';
	import type { PdfViewerProps, TextPosition } from '$lib/features/reader/reader.types';
	import type { Annotation } from '$lib/domain/reading/ReadingPosition';

	let { bookId, userId, fileUrl, totalPages }: PdfViewerProps = $props();

	// Engine instance
	let engine = $state<PdfEngine | null>(null);
	let container = $state<HTMLDivElement | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Position tracking
	let positionTracker = $state<ReturnType<typeof createPositionTracker> | null>(null);

	// Text layer containers for each page
	let textLayerContainers = $state<Map<number, HTMLElement>>(new Map());

	// Selection state
	let selectedText = $state('');
	let selectedPosition = $state<TextPosition | null>(null);
	let selectedPage = $state<number>(0);
	let showAnnotationToolbar = $state(false);
	let toolbarPosition = $state({ x: 0, y: 0 });

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

			// Load bookmarks
			try {
				const convexUser = await Effect.runPromise(lookupConvexUserId(userId));
				if (convexUser) {
					const bookmarks = await Effect.runPromise(fetchBookmarks(bookId, convexUser._id));
					readerStore.loadBookmarks(bookmarks);
				}
			} catch (bookmarkErr) {
				// Graceful degrade - continue without bookmarks
				console.error('Failed to load bookmarks:', bookmarkErr);
			}

			isLoading = false;
			readerStore.setIsLoading(false);

			// Render all pages
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

		// Clear existing
		pageContainer.innerHTML = '';
		textLayerContainers.clear();

		// Render all pages
		for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
			const pageWrapper = document.createElement('div');
			pageWrapper.className = 'pdf-page-wrapper relative flex justify-center py-4';
			pageWrapper.dataset.page = String(pageNum);

			// Canvas container
			const canvasContainer = document.createElement('div');
			canvasContainer.className = 'pdf-page shadow-lg';
			pageWrapper.appendChild(canvasContainer);

			// Text layer container
			const textLayerContainer = document.createElement('div');
			textLayerContainer.className = 'text-layer-container absolute inset-0';
			pageWrapper.appendChild(textLayerContainer);
			textLayerContainers.set(pageNum, textLayerContainer);

			// Highlight layer container
			const highlightContainer = document.createElement('div');
			highlightContainer.className =
				'highlight-layer-container absolute inset-0 pointer-events-none';
			pageWrapper.appendChild(highlightContainer);

			pageContainer.appendChild(pageWrapper);

			// Render page canvas with zoom for crisp quality
			try {
				await Effect.runPromise(
					engine!.renderPage(pageNum, canvasContainer, 1.5, readerStore.zoom)
				);
			} catch (err) {
				console.error(`Failed to render page ${pageNum}:`, err);
			}

			// Render text layer with matching zoom
			try {
				await Effect.runPromise(
					engine!.renderTextLayer(pageNum, textLayerContainer, 1.5, readerStore.zoom)
				);
			} catch (err) {
				console.error(`Failed to render text layer for page ${pageNum}:`, err);
			}
		}
	}

	function handleScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		const scrollOffset = target.scrollTop;

		// Calculate current page based on scroll position
		const newPage = calculateCurrentPage(target);
		if (newPage !== readerStore.currentPage) {
			readerStore.setCurrentPage(newPage);
		}

		if (positionTracker) {
			positionTracker.scheduleSaveFromScroll(scrollOffset);
		}
	}

	function calculateCurrentPage(scrollableContainer: HTMLElement): number {
		if (!engine) return 1;

		// Get all page wrappers
		const pageWrappers = scrollableContainer.querySelectorAll('[data-page]');
		if (pageWrappers.length === 0) return 1;

		// Find which page is most visible in the viewport
		const containerRect = scrollableContainer.getBoundingClientRect();
		const containerCenter = containerRect.top + containerRect.height / 2;

		let closestPage = 1;
		let closestDistance = Infinity;

		pageWrappers.forEach((wrapper) => {
			const pageNum = parseInt(wrapper.getAttribute('data-page') || '1', 10);
			const rect = wrapper.getBoundingClientRect();
			const pageCenter = rect.top + rect.height / 2;
			const distance = Math.abs(pageCenter - containerCenter);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestPage = pageNum;
			}
		});

		return closestPage;
	}

	/**
	 * Scroll to a specific page
	 */
	export function scrollToPage(pageNum: number) {
		if (!container) return;

		const pageWrapper = container.querySelector(`[data-page="${pageNum}"]`);
		if (pageWrapper) {
			pageWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleTextSelect(page: number, selection: { text: string; position: TextPosition }) {
		selectedText = selection.text;
		selectedPosition = selection.position;
		selectedPage = page;

		// Calculate toolbar position near selection
		const selection_ = window.getSelection();
		if (selection_ && selection_.rangeCount > 0) {
			const range = selection_.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			toolbarPosition = {
				x: rect.left + rect.width / 2 - 150,
				y: rect.top - 60
			};
		}

		showAnnotationToolbar = true;
	}

	function handleHighlight(color: string) {
		if (!selectedPosition || !selectedText) return;

		const now = Date.now();
		const annotation: Annotation = {
			id: `temp-${now}`,
			bookId,
			userId,
			type: 'highlight',
			page: selectedPage,
			position: selectedPosition,
			highlightedText: selectedText,
			note: Option.none(),
			color,
			createdAt: new Date(now),
			updatedAt: new Date(now)
		};

		readerStore.addAnnotation(annotation);
		clearSelection();
	}

	function handleAddNote() {
		// For now, just create a highlight without a note
		// Full note functionality can be added later
		handleHighlight('yellow');
	}

	function clearSelection() {
		selectedText = '';
		selectedPosition = null;
		selectedPage = 0;
		showAnnotationToolbar = false;
		window.getSelection()?.removeAllRanges();
	}

	// Watch for zoom changes - re-render all pages and preserve scroll position
	$effect(() => {
		const currentZoom = readerStore.zoom;
		if (currentZoom && engine && container) {
			// Preserve scroll progress proportionally
			const scrollProgress = calculateScrollProgress(container.scrollTop, container.scrollHeight);

			const pageContainer = container.querySelector('.pages-container');
			if (pageContainer) {
				// Clear and re-render all pages
				pageContainer.innerHTML = '';
				textLayerContainers.clear();

				// Re-render and restore position after completion
				renderAllPages(readerStore.totalPages).then(() => {
					requestAnimationFrame(() => {
						restoreScrollPosition(container!, scrollProgress);
					});
				});
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
	<div
		bind:this={container}
		onscroll={handleScroll}
		class="relative h-screen overflow-y-auto bg-background"
	>
		<div class="pages-container relative mx-auto max-w-5xl py-8">
			<!-- Pages rendered here with text and highlight layers -->
			{#each Array.from(textLayerContainers.entries()) as [pageNum, textLayerContainer] (pageNum)}
				{@const highlightContainer = textLayerContainer.nextElementSibling}
				{#if highlightContainer}
					<HighlightLayer
						page={pageNum}
						annotations={readerStore.annotations}
						scale={readerStore.zoom}
					/>
				{/if}
			{/each}
		</div>

		{#if showAnnotationToolbar}
			<AnnotationToolbar
				{selectedText}
				onHighlight={handleHighlight}
				onAddNote={handleAddNote}
				onCancel={clearSelection}
				position={toolbarPosition}
			/>
		{/if}
	</div>
{/if}
