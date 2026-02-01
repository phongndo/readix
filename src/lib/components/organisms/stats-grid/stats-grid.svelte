<script lang="ts" module>
	import type { Component } from 'svelte';
	import { cn } from '$lib/classnames.js';

	export interface StatsGridItem {
		icon: Component;
		value: string | number;
		label: string;
		color?: string;
		suffix?: string;
		onClick?: () => void;
	}

	export interface StatsGridProps {
		stats: StatsGridItem[];
		columns?: 2 | 3 | 4 | 5;
		class?: string;
	}
</script>

<script lang="ts">
	import StatCard from '$lib/components/molecules/stat-card/stat-card.svelte';

	let { stats, columns = 5, class: className }: StatsGridProps = $props();

	const gridClasses = {
		2: 'grid-cols-2',
		3: 'grid-cols-2 sm:grid-cols-3',
		4: 'grid-cols-2 sm:grid-cols-4',
		5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
	};
</script>

<div class={cn('grid gap-4', gridClasses[columns], className)}>
	{#each stats as stat (stat.label)}
		<StatCard
			icon={stat.icon}
			value={stat.value}
			label={stat.label}
			color={stat.color}
			suffix={stat.suffix}
			onClick={stat.onClick}
		/>
	{/each}
</div>
