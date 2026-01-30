<script lang="ts">
	import { Trophy, Clock, Calendar, BookOpen } from '@lucide/svelte';
	import StatsGrid from '$lib/components/organisms/stats-grid/stats-grid.svelte';
	import type { StatsGridItem } from '$lib/components/organisms/stats-grid/stats-grid.svelte';

	let { data } = $props();

	const stats: StatsGridItem[] = $derived([
		{
			icon: Trophy,
			value: data.achievements?.length || 0,
			label: 'Achievements',
			color: 'text-yellow-500'
		},
		{
			icon: Clock,
			value: Math.floor((data.stats?.totalReadingTime || 0) / 60),
			label: 'Total Time',
			suffix: 'h',
			color: 'text-blue-500'
		},
		{
			icon: Calendar,
			value: data.streak?.longest || 0,
			label: 'Best Streak',
			color: 'text-green-500'
		},
		{
			icon: BookOpen,
			value: data.stats?.totalBooksRead || 0,
			label: 'Completed',
			color: 'text-primary'
		}
	]);
</script>

<div class="min-h-screen bg-background">
	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-4xl">
			<!-- Profile Header -->
			<div class="mb-8 rounded-lg border bg-card p-6">
				<div class="flex items-start gap-4">
					<div
						class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold"
					>
						👤
					</div>
					<div>
						<h1 class="text-2xl font-bold">Reader Profile</h1>
						<p class="text-muted-foreground">Detailed statistics and achievements</p>
					</div>
				</div>
			</div>

			<!-- Stats Grid -->
			<div class="mb-8">
				<StatsGrid {stats} columns={4} />
			</div>

			<!-- Placeholder for more detailed stats -->
			<div class="rounded-lg border bg-card p-8 text-center">
				<p class="text-muted-foreground">More detailed statistics coming soon...</p>
			</div>
		</div>
	</main>
</div>
