<script lang="ts" module>
	import SearchInput from '$lib/components/atoms/search-input/search-input.svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { hybridSearch } from '$lib/features/reader/search-logic';
	import type { SearchResult } from '$lib/features/reader/reader.types';
	import type { Id } from '$lib/convex/api';
	import { Search } from '@lucide/svelte';
	import { runAppEffect } from '$lib/effect/runtime';

	export interface SearchPanelProps {
		bookId: string;
		onJumpToPage: (page: number) => void;
	}
</script>

<script lang="ts">
	let { bookId, onJumpToPage }: SearchPanelProps = $props();

	let searchRequestId = 0;

	function handleSearchInput(query: string) {
		readerStore.setSearchQuery(query);
		void performSearch(query, true);
	}

	async function performSearch(query: string, showLoadingState: boolean) {
		const requestId = ++searchRequestId;
		const normalizedQuery = query.trim();

		if (!normalizedQuery || normalizedQuery.length < 2) {
			readerStore.setSearchResults([]);
			readerStore.setIsSearching(false);
			return;
		}

		if (showLoadingState) {
			readerStore.setIsSearching(true);
		}

		try {
			const results = await runAppEffect(
				hybridSearch(
					bookId as Id<'books'>,
					normalizedQuery,
					readerStore.searchIndexEntries,
					readerStore.searchIndex
				)
			);

			if (requestId !== searchRequestId) {
				return;
			}
			readerStore.setSearchResults(results);
		} catch (err) {
			if (requestId !== searchRequestId) {
				return;
			}
			console.error('Search failed:', err);
			readerStore.setSearchResults([]);
		} finally {
			if (requestId === searchRequestId) {
				readerStore.setIsSearching(false);
			}
		}
	}

	$effect(() => {
		const query = readerStore.searchQuery;
		const indexedPageCount = readerStore.searchIndexEntries.length;
		if (query.trim().length < 2 || indexedPageCount === 0) return;

		const timeoutId = setTimeout(() => {
			void performSearch(query, false);
		}, 150);

		return () => {
			clearTimeout(timeoutId);
		};
	});

	function handleResultClick(result: SearchResult) {
		const index = readerStore.searchResults.findIndex(
			(entry) => entry.page === result.page && entry.score === result.score
		);
		if (index >= 0) {
			readerStore.setActiveSearchResultIndex(index);
		}
		onJumpToPage(result.page);
	}

	function truncateText(text: string, maxLength: number = 100): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	const displayedResults = $derived(readerStore.searchResults.slice(0, 20));
	const indexedPages = $derived(readerStore.searchIndexEntries.length);
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
		{#if indexedPages > 0}
			<p class="mt-2 text-xs text-muted-foreground">
				Indexed {indexedPages} / {readerStore.totalPages} pages for fast local search
			</p>
		{/if}
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
				{#each displayedResults as result, index (result.page + '-' + result.score)}
					{@const snippet = truncateText(result.text)}
					<button
						type="button"
						onclick={() => handleResultClick(result)}
						class="w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent {readerStore.activeSearchResultIndex ===
						index
							? 'border-primary/50 bg-accent'
							: ''}"
					>
						<div class="mb-1 text-xs font-medium text-muted-foreground">Page {result.page}</div>
						<p class="text-sm leading-relaxed text-foreground">{snippet}</p>
					</button>
				{/each}
				{#if readerStore.searchResults.length > 20}
					<div class="py-2 text-center text-xs text-muted-foreground">Showing first 20 results</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
