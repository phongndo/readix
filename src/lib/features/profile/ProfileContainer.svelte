<script lang="ts">
	import { BookOpen, Clock, Trophy } from '@lucide/svelte';
	import StatsGrid from '$lib/components/organisms/stats-grid/stats-grid.svelte';
	import type { StatsGridItem } from '$lib/components/organisms/stats-grid/stats-grid.svelte';
	import AchievementsPanel from '$lib/features/progress/AchievementsPanel.svelte';
	import ProgressStats from '$lib/features/progress/ProgressStats.svelte';
	import type { ProfileOverview } from '$lib/services/readingOverviewService';

	let {
		data
	}: {
		data: ProfileOverview;
	} = $props();

	const recentAchievements = $derived(
		data.achievements.slice(0, 3).map((achievement) => ({
			name: achievement.name,
			icon: achievement.icon
		}))
	);

	const stats: StatsGridItem[] = $derived([
		{
			icon: Trophy,
			value: data.achievements.length,
			label: 'Achievements',
			color: 'text-yellow-500'
		},
		{
			icon: Clock,
			value: Math.floor(data.stats.totalReadingTime / 60),
			label: 'Hours Read',
			suffix: 'h',
			color: 'text-blue-500'
		},
		{
			icon: BookOpen,
			value: data.stats.totalBooksRead,
			label: 'Completed',
			color: 'text-primary'
		}
	]);
</script>

<div class="min-h-screen bg-background">
	<main class="container mx-auto max-w-5xl px-4 py-8">
		<div class="mb-8">
			<h1 class="text-2xl font-bold">Reading Profile</h1>
			<p class="text-sm text-muted-foreground">Progress, streaks, and unlocked milestones.</p>
		</div>

		<div class="mb-6">
			<ProgressStats
				currentStreak={data.streak.current}
				longestStreak={data.streak.longest}
				{recentAchievements}
			/>
		</div>

		<div class="mb-6">
			<StatsGrid {stats} columns={3} />
		</div>

		<AchievementsPanel achievements={data.achievements} />
	</main>
</div>
