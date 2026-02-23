<script lang="ts">
	import { onDestroy } from 'svelte';
	import ReaderView from '$lib/features/reader/ReaderView.svelte';
	import NewAchievementModal from '$lib/features/progress/NewAchievementModal.svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import {
		startReading,
		updatePage,
		saveProgress,
		stopReading
	} from '$lib/features/reader/reader.logic';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Book } from '$lib/domain/book/Book';

	let {
		data
	}: {
		data: {
			book: Book | null;
		};
	} = $props();

	let newAchievements = $state<string[]>([]);
	let showAchievementModal = $state(false);
	let hasPersistedProgress = $state(false);
	let persistPromise: Promise<string[]> | null = null;

	$effect(() => {
		if (browser && data.book) {
			startReading(data.book);
			hasPersistedProgress = false;
			persistPromise = null;
		}
	});

	$effect(() => {
		if (!browser || !data.book) return;
		updatePage(readerStore.currentPage);
	});

	$effect(() => {
		if (!browser) return;

		document.addEventListener('exitreader', handleExit as EventListener);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			document.removeEventListener('exitreader', handleExit as EventListener);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	onDestroy(() => {
		stopReading();
		persistProgress(false).catch(console.error);
	});

	async function persistProgress(showAchievements = false): Promise<string[]> {
		if (!browser || hasPersistedProgress) {
			return [];
		}

		if (persistPromise) {
			return persistPromise;
		}

		const userId = page.data.userId;
		if (!userId) {
			return [];
		}

		persistPromise = saveProgress(userId)
			.then((achievements) => {
				hasPersistedProgress = true;

				if (showAchievements && achievements.length > 0) {
					newAchievements = achievements;
					showAchievementModal = true;
				}

				return achievements;
			})
			.catch((error) => {
				persistPromise = null;
				throw error;
			});

		return persistPromise;
	}

	async function handleExit() {
		try {
			await persistProgress(true);
		} catch (error) {
			console.error('Failed to save progress:', error);
		}

		stopReading();
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/library');
	}

	function handleBeforeUnload() {
		stopReading();
		persistProgress(false).catch(console.error);
	}
</script>

{#if data.book}
	<ReaderView book={data.book} />
{/if}

<NewAchievementModal bind:open={showAchievementModal} {newAchievements} />
