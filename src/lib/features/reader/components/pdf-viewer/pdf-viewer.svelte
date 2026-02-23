<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { Effect, Option } from 'effect';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { createPositionTracker } from '$lib/features/reader/position-tracker';
	import {
		calculateScrollProgress,
		restoreScrollPosition
	} from '$lib/domain/reading/scrollPreservation';
	import { fetchBookmarks, lookupConvexUserId } from '$lib/services/bookmarkService';
	import { fetchAnnotations, createAnnotation } from '$lib/services/annotationService';
	import { toastState } from '$lib/state/toastState.svelte';
	import { createSearchIndex } from '$lib/features/reader/search-logic';
	import { PdfRenderManager, type RenderTextItem } from '$lib/features/reader/pdf-render-manager';
	import AnnotationToolbar from '$lib/features/reader/components/annotation-toolbar/annotation-toolbar.svelte';
	import type { PdfViewerProps, TextPosition } from '$lib/features/reader/reader.types';
	import type { Annotation } from '$lib/domain/reading/ReadingPosition';

	let { bookId, userId, fileUrl, totalPages }: PdfViewerProps = $props();

	type PdfEngineClass = (typeof import('$lib/services/document/pdf-engine'))['PdfEngine'];
	type PdfEngineInstance = InstanceType<PdfEngineClass>;

	let engine = $state<PdfEngineInstance | null>(null);
	let renderManager = $state<PdfRenderManager | null>(null);
	let container = $state<HTMLDivElement | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let positionTracker = $state<ReturnType<typeof createPositionTracker> | null>(null);
	const textLayerContainers = new SvelteMap<number, HTMLElement>();
	const pageTextCache = new SvelteMap<number, string>();

	let selectedText = $state('');
	let selectedPosition = $state<TextPosition | null>(null);
	let selectedPage = $state<number>(0);
	let showAnnotationToolbar = $state(false);
	let toolbarPosition = $state({ x: 0, y: 0 });

	let basePageHeight = $state(1100);
	let appliedZoom = $state(1);
	let initialized = $state(false);

	onMount(async () => {
		if (!browser || !fileUrl || !container) return;

		try {
			readerStore.setIsLoading(true);
			readerStore.setBookId(bookId);
			readerStore.setFormat('pdf');
			readerStore.setTotalPages(totalPages);
			readerStore.setSearchIndexEntries([]);
			readerStore.setSearchIndex(null);
			readerStore.setSearchResults([]);
			pageTextCache.clear();

			const pdfModule = await import('$lib/services/document/pdf-engine');
			engine = new pdfModule.PdfEngine();

			const handle = await Effect.runPromise(engine.load(fileUrl));
			readerStore.setTotalPages(handle.totalPages);
			appliedZoom = readerStore.zoom;

			try {
				const dimensions = await Effect.runPromise(engine.getPageDimensions(1));
				basePageHeight = dimensions.height * 1.5 + 32;
			} catch {
				basePageHeight = 1100;
			}

			positionTracker = createPositionTracker(userId, bookId, 'pdf');
			const savedPosition = await Effect.runPromise(positionTracker.loadPosition());

			try {
				const convexUser = await Effect.runPromise(lookupConvexUserId(userId));
				if (convexUser) {
					const bookmarks = await Effect.runPromise(fetchBookmarks(bookId, convexUser._id));
					readerStore.loadBookmarks(bookmarks);

					const annotations = await Effect.runPromise(fetchAnnotations(bookId, convexUser._id));
					readerStore.loadAnnotations(annotations);
				}
			} catch (dataErr) {
				console.error('Failed to load bookmarks/annotations:', dataErr);
			}

			const pagesContainer = container.querySelector('.pages-container');
			if (!(pagesContainer instanceof HTMLElement)) {
				throw new Error('Pages container not found');
			}

			renderManager = new PdfRenderManager({
				container,
				pagesContainer,
				totalPages: handle.totalPages,
				zoom: readerStore.zoom,
				estimatedPageHeight: basePageHeight * readerStore.zoom,
				overscanPages: 5,
				renderPage: async (pageNum, pageContainer, zoom) => {
					if (!engine) return;
					await Effect.runPromise(engine.renderPage(pageNum, pageContainer, 1.5, zoom));
				},
				renderTextLayer: async (pageNum, textLayerContainer, zoom) => {
					if (!engine) return [];
					return await Effect.runPromise(
						engine.renderTextLayer(pageNum, textLayerContainer, 1.5, zoom)
					);
				},
				onTextLayerMounted: (pageNum, textLayerElement) => {
					textLayerContainers.set(pageNum, textLayerElement);
					textLayerElement.onmouseup = () => {
						handleTextSelection(pageNum);
					};
				},
				onPageText: (pageNum, textItems) => {
					indexPageText(pageNum, textItems);
				}
			});

			renderManager.initialize();
			renderManager.updateVisibleWindow();
			initialized = true;

			if (savedPosition && container) {
				requestAnimationFrame(() => {
					if (!container) return;
					container.scrollTop = savedPosition.scrollOffset;
					renderManager?.updateVisibleWindow();
				});
			}

			isLoading = false;
			readerStore.setIsLoading(false);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load PDF';
			readerStore.setError(error);
			isLoading = false;
			readerStore.setIsLoading(false);
		}
	});

	onDestroy(() => {
		if (positionTracker && browser && container) {
			const scrollOffset = container.scrollTop;
			positionTracker.updateFromScroll(scrollOffset, []);
			Effect.runPromise(positionTracker.saveImmediately()).catch(console.error);
			positionTracker.cleanup();
		}

		renderManager?.cleanup();
		renderManager = null;
		engine?.cleanup();
		engine = null;
		initialized = false;
	});

	function indexPageText(pageNum: number, textItems: RenderTextItem[]) {
		const text = textItems
			.map((item) => item.text)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();

		if (!text) return;
		if (pageTextCache.get(pageNum) === text) return;

		pageTextCache.set(pageNum, text);

		const nextEntries = Array.from(pageTextCache.entries())
			.map(([page, pageText]) => ({
				page,
				text: pageText,
				wordCount: pageText.split(/\s+/).filter(Boolean).length
			}))
			.sort((a, b) => a.page - b.page);

		readerStore.setSearchIndexEntries(nextEntries);
		readerStore.setSearchIndex(createSearchIndex(nextEntries));
	}

	function handleTextSelection(pageNum: number) {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) {
			return;
		}

		const selectedTextValue = selection.toString().trim();
		if (!selectedTextValue) return;

		const range = selection.getRangeAt(0);
		const rects = Array.from(range.getClientRects());
		const textLayerContainer = textLayerContainers.get(pageNum);
		if (!textLayerContainer) return;

		const containerRect = textLayerContainer.getBoundingClientRect();
		const currentZoom = readerStore.zoom;
		const baseScale = 1.5;

		const boundingBoxes = rects.map((rect) => ({
			x: (rect.left - containerRect.left) / (baseScale * currentZoom),
			y: (rect.top - containerRect.top) / (baseScale * currentZoom),
			width: rect.width / (baseScale * currentZoom),
			height: rect.height / (baseScale * currentZoom)
		}));

		selectedText = selectedTextValue;
		selectedPosition = {
			startOffset: 0,
			endOffset: selectedTextValue.length,
			boundingBoxes
		};
		selectedPage = pageNum;

		const firstRect = rects[0];
		toolbarPosition = {
			x: firstRect.left + firstRect.width / 2 - 150,
			y: firstRect.top - 60
		};

		showAnnotationToolbar = true;
	}

	function handleScroll(event: Event) {
		const target = event.target as HTMLDivElement;
		const scrollOffset = target.scrollTop;

		const currentPage = renderManager?.getCurrentPage() ?? 1;
		if (currentPage !== readerStore.currentPage) {
			readerStore.setCurrentPage(currentPage);
		}

		renderManager?.scheduleVisibleUpdate();

		if (positionTracker) {
			positionTracker.scheduleSaveFromScroll(scrollOffset);
		}
	}

	export function scrollToPage(pageNum: number) {
		renderManager?.scrollToPage(pageNum, 'smooth');
		readerStore.setCurrentPage(pageNum);
	}

	async function handleHighlight(color: string) {
		if (!selectedPosition || !selectedText) return;

		const now = Date.now();
		const tempId = `temp-${now}`;

		const annotation: Annotation = {
			id: tempId,
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

		try {
			const convexUser = await Effect.runPromise(lookupConvexUserId(userId));
			if (!convexUser) {
				toastState.showError('Not authenticated');
				return;
			}

			const annotationId = await Effect.runPromise(
				createAnnotation({
					bookId,
					userId: convexUser._id,
					type: 'highlight',
					page: selectedPage,
					position: selectedPosition,
					highlightedText: selectedText,
					color
				})
			);

			readerStore.removeAnnotation(tempId);
			readerStore.addAnnotation({
				...annotation,
				id: annotationId
			});

			toastState.showSuccess('Highlight saved');
		} catch (err) {
			console.error('Failed to save highlight:', err);
			toastState.showError('Failed to save highlight');
			readerStore.removeAnnotation(tempId);
		}
	}

	function handleAddNote() {
		handleHighlight('yellow');
	}

	function clearSelection() {
		selectedText = '';
		selectedPosition = null;
		selectedPage = 0;
		showAnnotationToolbar = false;
		window.getSelection()?.removeAllRanges();
	}

	$effect(() => {
		const currentZoom = readerStore.zoom;
		if (!container || !renderManager || !initialized) return;
		if (currentZoom === appliedZoom) return;

		const scrollProgress = calculateScrollProgress(container.scrollTop, container.scrollHeight);
		renderManager.setZoom(currentZoom, basePageHeight * currentZoom);

		requestAnimationFrame(() => {
			if (!container) return;
			restoreScrollPosition(container, scrollProgress);
			renderManager?.updateVisibleWindow();
		});

		appliedZoom = currentZoom;
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
		<div class="pages-container relative mx-auto max-w-5xl py-8"></div>

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
