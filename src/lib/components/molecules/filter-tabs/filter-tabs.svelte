<script lang="ts" module>
	import Button from '$lib/components/atoms/button/button.svelte';

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

<div class="flex gap-2 {className}">
	{#each tabs as tab (tab.id)}
		{@const isActive = activeFilter === tab.id}
		<Button
			variant={isActive ? 'primary' : 'secondary'}
			size="sm"
			onclick={() => onChange(tab.id)}
			class="gap-2 rounded-full"
		>
			{tab.label}
			<span
				class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs {isActive
					? 'bg-primary-foreground/20'
					: 'bg-background'}"
			>
				{tab.count}
			</span>
		</Button>
	{/each}
</div>
