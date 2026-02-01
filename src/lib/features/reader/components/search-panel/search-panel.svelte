<script lang="ts" module>
	import SearchInput from '$lib/components/atoms/search-input/search-input.svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import type { SearchResult } from '$lib/features/reader/reader.types';
	import { Search } from '@lucide/svelte';

	export interface SearchPanelProps {
		bookId: string;
		onJumpToPage: (page: number) => void;
	}
</script>

<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { bookId, onJumpToPage }: SearchPanelProps = $props();

	function handleSearchInput(query: string) {
		readerStore.setSearchQuery(query);
		// Note: actual search logic will be implemented separately
		// This is the UI-only implementation
	}

	function handleResultClick(result: SearchResult) {
		onJumpToPage(result.page);
	}

	function truncateText(text: string, maxLength: number = 100): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	const displayedResults = $derived(readerStore.searchResults.slice(0, 20));
</script>

<div class="flex h-full flex-col">
	<div class="border-b border-border p-4">
		<SearchInput
			value={readerStore.searchQuery}
			onInput={handleSearchInput}
			placeholder="Search in book..."
			debounceMs={300}
			class="w-full"
		/>
	</div>

	<div class="flex-1 overflow-y-auto p-4">
		{#if readerStore.isSearching}
			<div class="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
				<div
					class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
				></div>
				<span class="text-sm">Searching...</span>
			</div>
		{:else if readerStore.searchQuery === ''}
			<div class="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
				<Search class="h-8 w-8 opacity-50" />
				<span class="text-sm">Type to search...</span>
			</div>
		{:else if displayedResults.length === 0}
			<div class="py-8 text-center text-sm text-muted-foreground">No matches found</div>
		{:else}
			<div class="space-y-2">
				{#each displayedResults as result (result.page + '-' + result.score)}
					<button
						type="button"
						onclick={() => handleResultClick(result)}
						class="w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
					>
						<div class="mb-1 text-xs font-medium text-muted-foreground">Page {result.page}</div>
						<p class="text-sm leading-relaxed text-foreground">
							{#if result.highlightedText}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html result.highlightedText}
							{:else}
								{truncateText(result.text)}
							{/if}
						</p>
					</button>
				{/each}
				{#if readerStore.searchResults.length > 20}
					<div class="py-2 text-center text-xs text-muted-foreground">Showing first 20 results</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
