<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useClerkContext } from 'svelte-clerk/client';
	import Button from '$lib/components/ui/button/button.svelte';
	import StatsCards from '$lib/features/dashboard/StatsCards.svelte';
	import ContributionCalendar from '$lib/components/organisms/contribution-calendar/contribution-calendar.svelte';
	import RecentBooks from '$lib/features/dashboard/RecentBooks.svelte';
	import EmptyState from '$lib/features/dashboard/EmptyState.svelte';
	import UploadModal from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import type { UploadFormData } from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import { libraryState } from '$lib/state/libraryState.svelte';
	import type { Book } from '$lib/domain/book/Book';
	import { uploadBookWithFile } from '$lib/services/bookService';
	import { Effect } from 'effect';
	import { browser } from '$app/environment';

	let {
		data
	}: {
		data: {
			books: Book[];
			stats?: {
				totalBooksRead: number;
				totalReadingTime: number;
				totalPagesRead: number;
			};
			streak?: {
				current: number;
			};
			activity: Array<{ date: Date; pages: number }>;
		};
	} = $props();

	let showUploadModal = $state(false);
	let isLoading = $state(false);

	const ctx = useClerkContext();
	const user = $derived(ctx.user);
	const firstName = $derived(user?.firstName || 'Reader');

	const activity = $derived(data.activity || []);

	$effect(() => {
		if (browser && data.books) {
			libraryState.setBooks(data.books);
		}
	});

	function handleAddBookClick() {
		showUploadModal = true;
	}

	async function handleUploadBook(formData: UploadFormData) {
		if (!user?.id) {
			throw new Error('Not authenticated');
		}

		if (!formData.file) {
			throw new Error('A PDF file is required');
		}

		isLoading = true;
		try {
			const createdBook = await Effect.runPromise(
				uploadBookWithFile(user.id, formData.file, {
					title: formData.title,
					author: formData.author,
					description: formData.description,
					coverUrl: formData.coverUrl
				})
			);
			libraryState.addBook(createdBook);
			showUploadModal = false;
		} catch (error) {
			console.error('Failed to upload book:', error);
			throw new Error(error instanceof Error ? error.message : 'Failed to upload book', {
				cause: error
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-background">
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
		{#if libraryState.state.books.length === 0}
			<EmptyState onAddBook={handleAddBookClick} />
		{:else}
			<RecentBooks books={libraryState.state.books} />
		{/if}
	</main>
</div>

<UploadModal bind:open={showUploadModal} onSubmit={handleUploadBook} />
