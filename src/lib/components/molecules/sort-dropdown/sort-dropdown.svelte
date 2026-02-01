<script lang="ts" module>
	import { ChevronDown, Check } from '@lucide/svelte';
	import { Select } from 'bits-ui';

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
	];
</script>

<script lang="ts">
	let { sortBy, onChange, class: className }: SortDropdownProps = $props();
</script>

<Select.Root
	type="single"
	value={sortBy}
	onValueChange={(v) => onChange(v as 'updated' | 'title' | 'author' | 'progress')}
	items={sortOptions}
>
	<Select.Trigger
		class="inline-flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent {className}"
	>
		<span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label}</span>
		<ChevronDown class="h-4 w-4 opacity-50" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content class="z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-lg">
			<Select.Viewport>
				{#each sortOptions as option (option.value)}
					<Select.Item
						value={option.value}
						label={option.label}
						class="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent data-[selected]:bg-accent"
					>
						{#snippet children({ selected })}
							{option.label}
							{#if selected}
								<Check class="h-4 w-4" />
							{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
