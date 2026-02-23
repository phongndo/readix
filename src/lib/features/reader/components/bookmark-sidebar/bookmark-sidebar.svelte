<script lang="ts">
	import { Effect } from 'effect';
	import { Bookmark } from '@lucide/svelte';
	import BookmarkItem from '$lib/features/reader/components/bookmark-item/bookmark-item.svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { deleteBookmark } from '$lib/services/bookmarkService';
	import { toastState } from '$lib/state/toastState.svelte';
	import type { Bookmark as BookmarkType } from '$lib/domain/reading/ReadingPosition';

	export interface BookmarkSidebarProps {
		bookId: string;
		userId: string;
		currentPage: number;
		onJumpToPage: (page: number) => void;
	}

	let {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		bookId: _bookId,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		userId: _userId,
		currentPage,
		onJumpToPage
	}: BookmarkSidebarProps = $props();

	const sortedBookmarks = $derived(
		[...readerStore.bookmarks].sort((a: BookmarkType, b: BookmarkType) => a.page - b.page)
	);

	function handleBookmarkClick(bookmark: BookmarkType) {
		onJumpToPage(bookmark.page);
		readerStore.setSidebarTab('bookmarks');
	}

	async function handleDeleteBookmark(bookmark: BookmarkType) {
		try {
			await Effect.runPromise(deleteBookmark(bookmark.id, bookmark.userId));
			readerStore.deleteBookmark(bookmark.id);
			toastState.showSuccess('Bookmark deleted');
		} catch (err) {
			console.error('Failed to delete bookmark:', err);
			toastState.showError('Failed to delete bookmark');
		}
	}
</script>

<div class="flex h-full flex-col">
	{#if sortedBookmarks.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center p-6 text-center">
			<Bookmark class="mb-4 h-12 w-12 text-neutral-600" />
			<p class="text-sm text-neutral-400">No bookmarks yet. Press 'b' to add one.</p>
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto p-2">
			{#each sortedBookmarks as bookmark (bookmark.id)}
				<BookmarkItem
					{bookmark}
					isActive={bookmark.page === currentPage}
					onClick={() => handleBookmarkClick(bookmark)}
					onDelete={() => handleDeleteBookmark(bookmark)}
				/>
			{/each}
		</div>
	{/if}
</div>
