<script lang="ts">
	import { UserButton } from 'svelte-clerk';
	import { BookOpen, ArrowLeft, Trophy, Clock, Calendar } from '@lucide/svelte';
	import Button from '$lib/components/atoms/button/button.svelte';
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
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="container mx-auto flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" href="/">
					<ArrowLeft class="mr-2 h-4 w-4" />
					Back
				</Button>
				<div class="flex items-center gap-2">
					<BookOpen class="h-5 w-5" />
					<span class="font-semibold">Profile</span>
				</div>
			</div>
			<UserButton />
		</div>
	</header>

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
