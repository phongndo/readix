<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Effect, Option } from 'effect';
	import PdfViewer from '$lib/features/reader/components/pdf-viewer/pdf-viewer.svelte';
	import ReaderToolbar from '$lib/features/reader/components/reader-toolbar/reader-toolbar.svelte';
	import ReaderSidebar from '$lib/features/reader/components/reader-sidebar/reader-sidebar.svelte';
	import BookmarkDialog from '$lib/features/reader/components/bookmark-dialog/bookmark-dialog.svelte';
	import {
		initKeyboardShortcuts,
		cleanupKeyboardShortcuts
	} from '$lib/features/reader/keyboard-shortcuts';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { toastState } from '$lib/state/toastState.svelte';
	import {
		createBookmark,
		deleteBookmark,
		lookupConvexUserId,
		type BookmarkColor
	} from '$lib/services/bookmarkService';
	import { page } from '$app/state';
	import type { ReaderViewProps } from './reader.types';

	let { book }: ReaderViewProps = $props();

	// Determine if this is a PDF file or text content
	const hasFile = $derived(book.fileStorageId != null);
	const fileUrl = $derived(hasFile ? `/api/files/${book.fileStorageId}` : null);

	// Use reader store for reactive page tracking
	let currentPage = $derived(readerStore.currentPage);
	let containerRef = $state<HTMLElement | null>(null);
	let pdfViewerRef = $state<{ scrollToPage: (page: number) => void } | null>(null);
	let showBookmarkDialog = $state(false);

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

	function handleJumpToPage(pageNum: number) {
		if (pdfViewerRef) {
			pdfViewerRef.scrollToPage(pageNum);
		}
	}

	async function handleCreateBookmark(color: BookmarkColor) {
		const clerkId = page.data.userId;
		if (!clerkId) {
			toastState.showError('Not authenticated');
			return;
		}

		try {
			// Lookup Convex user ID
			const convexUser = await Effect.runPromise(lookupConvexUserId(clerkId));
			if (!convexUser) {
				toastState.showError('User not found');
				return;
			}

			const currentPageNum = readerStore.currentPage;

			// Create bookmark
			const bookmarkId = await Effect.runPromise(
				createBookmark({
					bookId: book.id,
					userId: convexUser._id,
					page: currentPageNum,
					title: `Page ${currentPageNum}`,
					color
				})
			);

			// Add to store
			readerStore.addBookmark({
				id: bookmarkId,
				bookId: book.id,
				userId: convexUser._id,
				page: currentPageNum,
				title: `Page ${currentPageNum}`,
				color: Option.some(color),
				createdAt: new Date()
			});

			toastState.showSuccess('Bookmark created');
			showBookmarkDialog = false;
		} catch (err) {
			console.error('Failed to create bookmark:', err);
			toastState.showError('Failed to create bookmark');
		}
	}

	async function handleDeleteBookmark() {
		const currentPageNum = readerStore.currentPage;
		const bookmark = readerStore.bookmarks.find((b) => b.page === currentPageNum);

		if (!bookmark) {
			toastState.showError('No bookmark on this page');
			return;
		}

		try {
			await Effect.runPromise(deleteBookmark(bookmark.id));
			readerStore.deleteBookmark(bookmark.id);
			toastState.showSuccess('Bookmark deleted');
		} catch (err) {
			console.error('Failed to delete bookmark:', err);
			toastState.showError('Failed to delete bookmark');
		}
	}

	// Keyboard shortcuts setup
	onMount(() => {
		if (!browser || !containerRef) return;

		const cleanup = initKeyboardShortcuts(containerRef, {
			scrollUp: (amount = 50) => {
				if (containerRef) {
					containerRef.scrollBy({ top: -amount, behavior: 'smooth' });
				}
			},
			scrollDown: (amount = 50) => {
				if (containerRef) {
					containerRef.scrollBy({ top: amount, behavior: 'smooth' });
				}
			},
			previousPage: () => {
				readerStore.previousPage();
			},
			nextPage: () => {
				readerStore.nextPage();
			},
			goToStart: () => {
				if (containerRef) {
					containerRef.scrollTo({ top: 0, behavior: 'smooth' });
				}
			},
			goToEnd: () => {
				if (containerRef) {
					containerRef.scrollTo({ top: containerRef.scrollHeight, behavior: 'smooth' });
				}
			},
			addBookmark: () => {
				showBookmarkDialog = true;
			},
			deleteBookmark: () => {
				handleDeleteBookmark();
			},
			focusSearch: () => {
				readerStore.setSidebarTab('search');
				readerStore.toggleSidebar();
			},
			nextSearchResult: () => {
				// TODO: Implement search result navigation
			},
			previousSearchResult: () => {
				// TODO: Implement search result navigation
			},
			zoomIn: () => {
				readerStore.zoomIn();
			},
			zoomOut: () => {
				readerStore.zoomOut();
			},
			resetZoom: () => {
				readerStore.setZoom(1.0);
			},
			fitWidth: () => {
				// TODO: Calculate fit width zoom
				readerStore.setZoom(1.5);
			},
			fitPage: () => {
				// TODO: Calculate fit page zoom
				readerStore.setZoom(1.0);
			},
			toggleSidebar: () => {
				readerStore.toggleSidebar();
			},
			goBack: () => {
				handleExit();
			}
		});

		return cleanup;
	});

	onDestroy(() => {
		cleanupKeyboardShortcuts();
	});
</script>

<div class="flex h-screen flex-col bg-background">
	<!-- Toolbar -->
	<ReaderToolbar
		title={book.title}
		author={book.author}
		{currentPage}
		totalPages={readerStore.totalPages || book.totalPages}
		onBack={handleExit}
		onToggleSidebar={() => readerStore.toggleSidebar()}
		onSearchClick={() => {
			readerStore.setSidebarTab('search');
			if (!readerStore.isSidebarOpen) readerStore.toggleSidebar();
		}}
		zoom={readerStore.zoom}
		onZoomChange={(newZoom) => readerStore.setZoom(newZoom)}
		isSidebarOpen={readerStore.isSidebarOpen}
	/>

	<!-- Bookmark Dialog -->
	<BookmarkDialog
		open={showBookmarkDialog}
		page={readerStore.currentPage}
		onSave={handleCreateBookmark}
		onCancel={() => (showBookmarkDialog = false)}
	/>

	<!-- Main content area with optional sidebar -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Reading area -->
		<main bind:this={containerRef} class="flex-1 overflow-hidden">
			{#if hasFile && fileUrl && page.data.userId}
				<PdfViewer
					bind:this={pdfViewerRef}
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

		<!-- Sidebar on the right -->
		{#if readerStore.isSidebarOpen}
			<ReaderSidebar
				bookId={book.id}
				userId={page.data.userId || ''}
				{currentPage}
				onJumpToPage={handleJumpToPage}
				onClose={() => readerStore.toggleSidebar()}
				position={readerStore.sidebarPosition}
			/>
		{/if}
	</div>
</div>
