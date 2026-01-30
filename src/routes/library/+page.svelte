<script lang="ts">
	import { SignedIn } from 'svelte-clerk';
	import LibraryView from '$lib/features/library/LibraryView.svelte';
	import ProgressStats from '$lib/features/progress/ProgressStats.svelte';
	import AchievementsPanel from '$lib/features/progress/AchievementsPanel.svelte';
	import NewAchievementModal from '$lib/features/progress/NewAchievementModal.svelte';
	import { libraryStore } from '$lib/stores/libraryStore';
	import { addBook, removeBook } from '$lib/features/library/library.logic';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { data } = $props();
	let newAchievements = $state<string[]>([]);
	let showAchievementModal = $state(false);

	$effect(() => {
		if (browser && data.books) {
			libraryStore.setBooks(data.books);
		}
	});

	$effect(() => {
		if (browser) {
			document.addEventListener('addbook', handleAddBook as EventListener);
			document.addEventListener('deletebook', handleDeleteBook as EventListener);

			return () => {
				document.removeEventListener('addbook', handleAddBook as EventListener);
				document.removeEventListener('deletebook', handleDeleteBook as EventListener);
			};
		}
	});

	async function handleAddBook(e: Event) {
		const customEvent = e as CustomEvent;
		const userId = page.data.userId;
		if (!userId) return;

		try {
			await addBook(userId, customEvent.detail);
		} catch (error) {
			console.error('Failed to add book:', error);
		}
	}

	async function handleDeleteBook(e: Event) {
		const customEvent = e as CustomEvent;
		const userId = page.data.userId;
		if (!userId) return;

		try {
			await removeBook(customEvent.detail.bookId, userId);
		} catch (error) {
			console.error('Failed to delete book:', error);
		}
	}
</script>

<SignedIn>
	<div class="container mx-auto max-w-6xl p-4">
		<div class="grid gap-6 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<LibraryView
					books={$libraryStore.books}
					isLoading={$libraryStore.isLoading}
					error={$libraryStore.error}
				/>
			</div>
			<div class="space-y-6">
				<ProgressStats
					currentStreak={data.streak.current}
					longestStreak={data.streak.longest}
					recentAchievements={data.achievements}
				/>
				<AchievementsPanel achievements={data.achievements} />
			</div>
		</div>
	</div>

	<NewAchievementModal bind:open={showAchievementModal} {newAchievements} />
</SignedIn>
