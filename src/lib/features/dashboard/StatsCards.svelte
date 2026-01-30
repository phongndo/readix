<script lang="ts">
	import { BookOpen, Flame, Clock, FileText, Target } from '@lucide/svelte';

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

	const stats = $derived([
		{ icon: BookOpen, value: books, label: 'Books', color: 'text-primary' },
		{ icon: Flame, value: streak, label: 'Day Streak', color: 'text-orange-500' },
		{ icon: Clock, value: hours, label: 'Hours Read', suffix: 'h', color: 'text-blue-500' },
		{ icon: FileText, value: pages, label: 'Pages', color: 'text-green-500' },
		{ icon: Target, value: goal, label: 'Goal Progress', suffix: '%', color: 'text-purple-500' }
	]);
</script>

<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
	{#each stats as stat, index (index)}
		<div class="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-muted p-2">
					<stat.icon class="h-5 w-5 {stat.color}" />
				</div>
				<div>
					<p class="text-2xl font-bold">{stat.value}{stat.suffix || ''}</p>
					<p class="text-xs text-muted-foreground">{stat.label}</p>
				</div>
			</div>
		</div>
	{/each}
</div>
