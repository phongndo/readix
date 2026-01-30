<script lang="ts">
	import { Flame, Award, BookOpen } from '@lucide/svelte';

	let {
		currentStreak = 0,
		longestStreak = 0,
		recentAchievements = [] as Array<{ name: string; icon: string }>
	}: {
		currentStreak: number;
		longestStreak: number;
		recentAchievements: Array<{ name: string; icon: string }>;
	} = $props();
</script>

<div class="grid gap-4 sm:grid-cols-3">
	<div class="flex items-center gap-3 rounded-lg border bg-card p-4">
		<div class="rounded-full bg-orange-100 p-2 dark:bg-orange-900/20">
			<Flame class="h-5 w-5 text-orange-600" />
		</div>
		<div>
			<p class="text-2xl font-bold">{currentStreak}</p>
			<p class="text-xs text-muted-foreground">Day Streak</p>
		</div>
	</div>

	<div class="flex items-center gap-3 rounded-lg border bg-card p-4">
		<div class="rounded-full bg-primary/10 p-2">
			<BookOpen class="h-5 w-5 text-primary" />
		</div>
		<div>
			<p class="text-2xl font-bold">{longestStreak}</p>
			<p class="text-xs text-muted-foreground">Best Streak</p>
		</div>
	</div>

	<div class="flex items-center gap-3 rounded-lg border bg-card p-4">
		<div class="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
			<Award class="h-5 w-5 text-yellow-600" />
		</div>
		<div>
			<p class="text-2xl font-bold">{recentAchievements.length}</p>
			<p class="text-xs text-muted-foreground">Achievements</p>
		</div>
	</div>
</div>
