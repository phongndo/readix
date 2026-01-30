<script lang="ts" module>
	import { ChevronDown } from '@lucide/svelte';

	export interface SortDropdownProps {
		sortBy: 'updated' | 'title' | 'author' | 'progress';
		onChange: (sort: 'updated' | 'title' | 'author' | 'progress') => void;
		class?: string;
	}

	const sortOptions = [
		{ value: 'updated', label: 'Recently Updated' },
		{ value: 'title', label: 'Title (A-Z)' },
		{ value: 'author', label: 'Author (A-Z)' },
		{ value: 'progress', label: 'Progress' }
	] as const;
</script>

<script lang="ts">
	let { sortBy, onChange, class: className }: SortDropdownProps = $props();

	let isOpen = $state(false);

	function handleSelect(value: 'updated' | 'title' | 'author' | 'progress') {
		onChange(value);
		isOpen = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.sort-dropdown')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative sort-dropdown {className}">
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent"
	>
		<span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label}</span>
		<ChevronDown class="h-4 w-4" />
	</button>

	{#if isOpen}
		<div class="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover shadow-lg">
			<div class="py-1">
				{#each sortOptions as option (option.value)}
					<button
						type="button"
						onclick={() => handleSelect(option.value)}
						class="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-accent {sortBy ===
						option.value
							? 'font-medium'
							: ''}"
					>
						{option.label}
						{#if sortBy === option.value}
							<svg
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M5 12l5 5L20 7" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
