<script lang="ts" module>
	import Button from '$lib/components/ui/button/button.svelte';
	import SearchPanel from '$lib/features/reader/components/search-panel/search-panel.svelte';
	import BookmarkSidebar from '$lib/features/reader/components/bookmark-sidebar/bookmark-sidebar.svelte';
	import AnnotationSidebar from '$lib/features/reader/components/annotation-sidebar/annotation-sidebar.svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { Bookmark, Search, MessageSquare, X } from '@lucide/svelte';

	export interface ReaderSidebarProps {
		bookId: string;
		userId: string;
		currentPage: number;
		onJumpToPage: (page: number) => void;
		onClose: () => void;
	}

	interface TabConfig {
		id: 'bookmarks' | 'search' | 'annotations';
		label: string;
		icon: typeof Bookmark;
	}
</script>

<script lang="ts">
	let { bookId, userId, currentPage, onJumpToPage, onClose }: ReaderSidebarProps = $props();

	const tabs: TabConfig[] = [
		{ id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
		{ id: 'search', label: 'Search', icon: Search },
		{ id: 'annotations', label: 'Annotations', icon: MessageSquare }
	];

	function setActiveTab(tab: 'bookmarks' | 'search' | 'annotations') {
		readerStore.setSidebarTab(tab);
	}

	const activeTab = $derived(readerStore.sidebarTab);
</script>

<div class="flex h-full w-80 flex-col border-r border-border bg-background">
	<!-- Header with tabs and close button -->
	<div class="flex items-center justify-between border-b border-border p-4">
		<div class="flex gap-1">
			{#each tabs as tab (tab.id)}
				<Button
					variant="ghost"
					size="sm"
					onclick={() => setActiveTab(tab.id)}
					class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium {activeTab ===
					tab.id
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
				>
					<tab.icon class="h-4 w-4" />
					{tab.label}
				</Button>
			{/each}
		</div>
		<Button variant="ghost" size="icon-sm" onclick={onClose} class="h-8 w-8 text-muted-foreground">
			<X class="h-4 w-4" />
		</Button>
	</div>

	<!-- Tab content -->
	<div class="flex-1 overflow-hidden">
		{#if activeTab === 'bookmarks'}
			<BookmarkSidebar {bookId} {userId} {currentPage} {onJumpToPage} />
		{:else if activeTab === 'search'}
			<SearchPanel {bookId} {onJumpToPage} />
		{:else if activeTab === 'annotations'}
			<AnnotationSidebar {bookId} {userId} {currentPage} {onJumpToPage} />
		{/if}
	</div>
</div>
