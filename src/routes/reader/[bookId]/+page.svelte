<script lang="ts">
	import { SignedIn, SignedOut, RedirectToSignIn } from 'svelte-clerk';
	import ReaderView from '$lib/features/reader/ReaderView.svelte';
	import NewAchievementModal from '$lib/features/progress/NewAchievementModal.svelte';
	import {
		startReading,
		updatePage,
		saveProgress,
		stopReading
	} from '$lib/features/reader/reader.logic';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let newAchievements = $state<string[]>([]);
	let showAchievementModal = $state(false);

	$effect(() => {
		if (browser && data.book) {
			startReading(data.book);
		}
	});

	$effect(() => {
		if (browser) {
			document.addEventListener('pagechange', handlePageChange as EventListener);
			document.addEventListener('exitreader', handleExit as EventListener);
			window.addEventListener('beforeunload', handleBeforeUnload);

			return () => {
				document.removeEventListener('pagechange', handlePageChange as EventListener);
				document.removeEventListener('exitreader', handleExit as EventListener);
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
	});

	function handlePageChange(e: CustomEvent) {
		updatePage(e.detail.page);
	}

	async function handleExit() {
		const userId = page.data.userId;
		if (userId && browser) {
			try {
				newAchievements = await saveProgress(userId);
				if (newAchievements.length > 0) {
					showAchievementModal = true;
				}
			} catch (error) {
				console.error('Failed to save progress:', error);
			}
		}
		stopReading();
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/library');
	}

	function handleBeforeUnload() {
		const userId = page.data.userId;
		if (userId && browser) {
			saveProgress(userId).catch(console.error);
		}
	}
</script>

<SignedOut>
	<RedirectToSignIn />
</SignedOut>

<SignedIn>
	{#if data.book}
		<ReaderView book={data.book} />
	{/if}

	<NewAchievementModal bind:open={showAchievementModal} {newAchievements} />
</SignedIn>
