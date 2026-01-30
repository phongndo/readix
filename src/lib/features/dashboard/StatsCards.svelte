<script lang="ts">
	import { BookOpen, Flame, Clock, FileText, Target } from '@lucide/svelte';
	import StatsGrid from '$lib/components/organisms/stats-grid/stats-grid.svelte';
	import type { StatsGridItem } from '$lib/components/organisms/stats-grid/stats-grid.svelte';

	let {
		books = 0,
		streak = 0,
		hours = 0,
		pages = 0,
		goal = 0
	}: {
		books: number;
		streak: number;
		hours: number;
		pages: number;
		goal: number;
	} = $props();

	const stats: StatsGridItem[] = $derived([
		{ icon: BookOpen, value: books, label: 'Books', color: 'text-primary' },
		{ icon: Flame, value: streak, label: 'Day Streak', color: 'text-orange-500' },
		{ icon: Clock, value: hours, label: 'Hours Read', suffix: 'h', color: 'text-blue-500' },
		{ icon: FileText, value: pages, label: 'Pages', color: 'text-green-500' },
		{ icon: Target, value: goal, label: 'Goal Progress', suffix: '%', color: 'text-purple-500' }
	]);
</script>

<StatsGrid {stats} columns={5} />
