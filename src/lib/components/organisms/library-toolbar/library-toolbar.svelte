<script lang="ts" module>
	import { LayoutGrid, List } from '@lucide/svelte';
	import SearchBar from '$lib/components/molecules/search-bar/search-bar.svelte';
	import FilterTabs from '$lib/components/molecules/filter-tabs/filter-tabs.svelte';
	import SortDropdown from '$lib/components/molecules/sort-dropdown/sort-dropdown.svelte';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';

	export interface LibraryToolbarProps {
		searchQuery: string;
		resultCount: number;
		activeFilter: 'all' | 'in-progress' | 'completed';
		filterCounts: {
			all: number;
			inProgress: number;
			completed: number;
		};
		sortBy: 'updated' | 'title' | 'author' | 'progress';
		viewMode: 'grid' | 'list';
		onSearch: (query: string) => void;
		onFilterChange: (filter: 'all' | 'in-progress' | 'completed') => void;
		onSortChange: (sort: 'updated' | 'title' | 'author' | 'progress') => void;
		onViewModeChange: (mode: 'grid' | 'list') => void;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		searchQuery = $bindable(''),
		resultCount,
		activeFilter,
		filterCounts,
		sortBy,
		viewMode,
		onSearch,
		onFilterChange,
		onSortChange,
		onViewModeChange,
		class: className
	}: LibraryToolbarProps = $props();
</script>

<div class="flex flex-col gap-4 {className}">
	<!-- Top row: Search, Sort, View toggle -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
		<SearchBar bind:value={searchQuery} {resultCount} onInput={onSearch} class="flex-1" />

		<div class="flex items-center gap-2">
			<SortDropdown {sortBy} onChange={onSortChange} />

			<div class="flex rounded-md border">
				<Tooltip content="Grid view" position="bottom">
					{#snippet children({ props })}
						<button
							{...props}
							type="button"
							onclick={() => onViewModeChange('grid')}
							class="p-2 {viewMode === 'grid'
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:bg-accent/50'}"
							aria-label="Grid view"
						>
							<LayoutGrid class="h-4 w-4" />
						</button>
					{/snippet}
				</Tooltip>
				<Tooltip content="List view" position="bottom">
					{#snippet children({ props })}
						<button
							{...props}
							type="button"
							onclick={() => onViewModeChange('list')}
							class="p-2 {viewMode === 'list'
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:bg-accent/50'}"
							aria-label="List view"
						>
							<List class="h-4 w-4" />
						</button>
					{/snippet}
				</Tooltip>
			</div>
		</div>
	</div>

	<!-- Bottom row: Filter tabs -->
	<FilterTabs {activeFilter} counts={filterCounts} onChange={onFilterChange} />
</div>
