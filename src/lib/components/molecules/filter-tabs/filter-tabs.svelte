<script lang="ts" module>
	import { Tabs } from 'bits-ui';

	export interface FilterTabsProps {
		activeFilter: 'all' | 'in-progress' | 'completed';
		counts: {
			all: number;
			inProgress: number;
			completed: number;
		};
		onChange: (filter: 'all' | 'in-progress' | 'completed') => void;
		class?: string;
	}
</script>

<script lang="ts">
	let { activeFilter, counts, onChange, class: className }: FilterTabsProps = $props();

	const tabs = $derived([
		{ id: 'all', label: 'All', count: counts.all },
		{ id: 'in-progress', label: 'In Progress', count: counts.inProgress },
		{ id: 'completed', label: 'Completed', count: counts.completed }
	] as const);
</script>

<Tabs.Root
	value={activeFilter}
	onValueChange={(v) => onChange(v as 'all' | 'in-progress' | 'completed')}
	class={className}
>
	<Tabs.List class="flex gap-2">
		{#each tabs as tab (tab.id)}
			<Tabs.Trigger
				value={tab.id}
				class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80"
			>
				{tab.label}
				<span
					class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs data-[state=active]:bg-primary-foreground/20 data-[state=inactive]:bg-background"
				>
					{tab.count}
				</span>
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
</Tabs.Root>
