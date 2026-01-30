<script lang="ts">
	import { UserButton } from 'svelte-clerk';
	import { BookOpen, Bell } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import StatsCards from '$lib/features/dashboard/StatsCards.svelte';
	import ContributionCalendar from '$lib/features/dashboard/ContributionCalendar.svelte';
	import RecentBooks from '$lib/features/dashboard/RecentBooks.svelte';
	import EmptyState from '$lib/features/dashboard/EmptyState.svelte';
	import { libraryStore } from '$lib/stores/libraryStore';
	import { browser } from '$app/environment';
	import { SvelteDate } from 'svelte/reactivity';

	let { data } = $props();
	let showAddModal = $state(false);

	// Mock activity data for calendar (replace with real data)
	const mockActivity = Array.from({ length: 100 }, (_, i) => {
		const activityDate = new SvelteDate();
		activityDate.setDate(activityDate.getDate() - i);
		return {
			date: activityDate,
			pages: Math.random() > 0.7 ? Math.floor(Math.random() * 150) : 0
		};
	}).filter((a) => a.pages > 0);

	$effect(() => {
		if (browser && data.books) {
			libraryStore.setBooks(data.books);
		}
	});

	function handleUpload() {
		showAddModal = true;
	}
</script>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="container mx-auto flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<BookOpen class="h-5 w-5" />
				<span class="font-semibold">Readix</span>
			</div>
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" class="relative">
					<Bell class="h-4 w-4" />
					<span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
				</Button>
				<UserButton />
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-6">
		<!-- Welcome -->
		<div class="mb-6">
			<h1 class="text-2xl font-bold">Welcome back</h1>
			<p class="text-muted-foreground">Track your reading progress and build your streak</p>
		</div>

		<!-- Stats -->
		<div class="mb-6">
			<StatsCards
				books={data.stats?.totalBooksRead || 0}
				streak={data.streak?.current || 0}
				hours={Math.floor((data.stats?.totalReadingTime || 0) / 60)}
				pages={data.stats?.totalPagesRead || 0}
				goal={75}
			/>
		</div>

		<!-- Activity Calendar -->
		<div class="mb-6">
			<ContributionCalendar activity={mockActivity} />
		</div>

		<!-- Books Section -->
		{#if $libraryStore.books.length === 0}
			<EmptyState onUpload={handleUpload} />
		{:else}
			<RecentBooks books={$libraryStore.books} />
		{/if}
	</main>
</div>

<!-- Add Book Modal would go here -->
{#if showAddModal}
	<!-- Import and use AddBookModal -->
{/if}
