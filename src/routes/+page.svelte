<script lang="ts">
	import { UserButton, useClerkContext } from 'svelte-clerk/client';
	import { BookOpen, Bell } from '@lucide/svelte';
	import Button from '$lib/components/atoms/button/button.svelte';
	import StatsCards from '$lib/features/dashboard/StatsCards.svelte';
	import ContributionCalendar from '$lib/components/organisms/contribution-calendar/contribution-calendar.svelte';
	import RecentBooks from '$lib/features/dashboard/RecentBooks.svelte';
	import EmptyState from '$lib/features/dashboard/EmptyState.svelte';
	import AddBookModal from '$lib/features/library/AddBookModal.svelte';
	import { libraryStore } from '$lib/stores/libraryStore';
	import { browser } from '$app/environment';
	import * as bookService from '$lib/services/bookService';
	import { Effect } from 'effect';

	let { data } = $props();
	let showAddModal = $state(false);
	let isLoading = $state(false);

	const ctx = useClerkContext();
	const user = $derived(ctx.user);
	const firstName = $derived(user?.firstName || 'Reader');

	// Use real activity data from server
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const activity = $derived(((data as any).activity as Array<{ date: Date; pages: number }>) || []);

	$effect(() => {
		if (browser && data.books) {
			libraryStore.setBooks(data.books);
		}
	});

	function handleUpload() {
		showAddModal = true;
	}

	async function handleAddBook(event: CustomEvent) {
		const formData = event.detail;
		isLoading = true;

		try {
			if (user?.id) {
				await Effect.runPromise(
					bookService.createBook(user.id, {
						title: formData.title,
						author: formData.author,
						description: formData.description,
						totalPages: formData.totalPages,
						content: formData.content,
						coverUrl: formData.coverUrl
					})
				);
				// Refresh the page to get updated data
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to add book:', error);
			alert('Failed to add book. Please try again.');
		} finally {
			isLoading = false;
			showAddModal = false;
		}
	}

	// Listen for addbook event
	$effect(() => {
		if (!browser) return;

		const handler = (e: Event) => handleAddBook(e as CustomEvent);
		document.addEventListener('addbook', handler);

		return () => {
			document.removeEventListener('addbook', handler);
		};
	});
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
			<h1 class="text-2xl font-bold">
				{#if isLoading}
					Loading...
				{:else}
					Welcome back, {firstName}
				{/if}
			</h1>
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
			<ContributionCalendar {activity} />
		</div>

		<!-- Books Section -->
		{#if $libraryStore.books.length === 0}
			<EmptyState onUpload={handleUpload} />
		{:else}
			<RecentBooks books={$libraryStore.books} />
		{/if}
	</main>
</div>
<!-- Add Book Modal -->
{#if showAddModal}
	<AddBookModal bind:open={showAddModal} />
{/if}
