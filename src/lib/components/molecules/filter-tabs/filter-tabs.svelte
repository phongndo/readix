<script lang="ts" module>
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
		<button
			type="button"
			onclick={() => onChange(tab.id)}
			class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors {activeFilter ===
			tab.id
				? 'bg-primary text-primary-foreground'
				: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
		>
			{tab.label}
			<span
				class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs {activeFilter ===
				tab.id
					? 'bg-primary-foreground/20'
					: 'bg-background'}"
			>
				{tab.count}
			</span>
		</button>
	{/each}
</div>
