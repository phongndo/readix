<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useClerkContext } from 'svelte-clerk/client';
	import Button from '$lib/components/atoms/button/button.svelte';
	import StatsCards from '$lib/features/dashboard/StatsCards.svelte';
	import ContributionCalendar from '$lib/components/organisms/contribution-calendar/contribution-calendar.svelte';
	import RecentBooks from '$lib/features/dashboard/RecentBooks.svelte';
	import EmptyState from '$lib/features/dashboard/EmptyState.svelte';
	import UploadModal from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import { libraryStore } from '$lib/stores/libraryStore';
	import { uploadBookWithFile } from '$lib/services/bookService';
	import * as bookService from '$lib/services/bookService';
	import { Effect } from 'effect';
	import { browser } from '$app/environment';

	let { data } = $props();
	let showUploadModal = $state(false);
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

	function handleAddBookClick() {
		showUploadModal = true;
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
						totalPages: formData.totalPages || 0,
						content: formData.content || '',
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
			showUploadModal = false;
		}
	}

	async function handleUploadBook(event: CustomEvent) {
		const { file, title, author, description, coverUrl } = event.detail;
		isLoading = true;

		try {
			if (user?.id) {
				if (file) {
					// Upload with file
					await Effect.runPromise(
						uploadBookWithFile(user.id, file, {
							title,
							author,
							description,
							coverUrl
						})
					);
				} else {
					// Manual entry (no file)
					await Effect.runPromise(
						bookService.createBook(user.id, {
							title,
							author,
							description,
							totalPages: 0,
							content: '',
							coverUrl
						})
					);
				}
				// Refresh the page to get updated data
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to upload book:', error);
			alert('Failed to upload book. Please try again.');
		} finally {
			isLoading = false;
			showUploadModal = false;
		}
	}

	// Listen for addbook and uploadbook events
	$effect(() => {
		if (!browser) return;

		const addHandler = (e: Event) => handleAddBook(e as CustomEvent);
		const uploadHandler = (e: Event) => handleUploadBook(e as CustomEvent);

		document.addEventListener('addbook', addHandler);
		document.addEventListener('uploadbook', uploadHandler);

		return () => {
			document.removeEventListener('addbook', addHandler);
			document.removeEventListener('uploadbook', uploadHandler);
		};
	});
</script>

<div class="min-h-screen bg-background">
	<!-- Main Content -->
	<main class="container mx-auto px-4 py-6">
		<!-- Welcome -->
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold">
					{#if isLoading}
						Loading...
					{:else}
						Welcome back, {firstName}
					{/if}
				</h1>
				<p class="text-muted-foreground">Track your reading progress and build your streak</p>
			</div>
			<Button onclick={handleAddBookClick}>
				<Plus class="mr-2 h-4 w-4" />
				Add Book
			</Button>
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
			<EmptyState onAddBook={handleAddBookClick} />
		{:else}
			<RecentBooks books={$libraryStore.books} />
		{/if}
	</main>
</div>

<!-- Upload Modal -->
<UploadModal bind:open={showUploadModal} />
