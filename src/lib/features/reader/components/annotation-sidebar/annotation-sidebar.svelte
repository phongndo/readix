<script lang="ts">
	import { MessageSquare } from '@lucide/svelte';
	import AnnotationItem from '$lib/features/reader/components/annotation-item/annotation-item.svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
	import { Effect } from 'effect';
	import { deleteBookmark } from '$lib/services/bookmarkService';
	import { toastState } from '$lib/state/toastState.svelte';
	import type { Annotation } from '$lib/domain/reading/ReadingPosition';

	export interface AnnotationSidebarProps {
		bookId: string;
		userId: string;
		currentPage: number;
		onJumpToPage: (page: number) => void;
	}

	let {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		bookId: _bookId,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		userId: _userId,
		currentPage,
		onJumpToPage
	}: AnnotationSidebarProps = $props();

	const sortedAnnotations = $derived(
		[...readerStore.annotations].sort((a: Annotation, b: Annotation) => {
			// Sort by page first, then by creation date
			if (a.page !== b.page) {
				return a.page - b.page;
			}
			return a.createdAt.getTime() - b.createdAt.getTime();
		})
	);

	function handleAnnotationClick(annotation: Annotation) {
		onJumpToPage(annotation.page);
		readerStore.setSidebarTab('annotations');
	}

	async function handleDeleteAnnotation(annotationId: string) {
		try {
			// Delete from database
			await Effect.runPromise(deleteBookmark(annotationId));
			// Remove from store
			readerStore.removeAnnotation(annotationId);
			toastState.showSuccess('Annotation deleted');
		} catch (err) {
			console.error('Failed to delete annotation:', err);
			toastState.showError('Failed to delete annotation');
		}
	}
</script>

<div class="flex h-full flex-col">
	{#if sortedAnnotations.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center p-6 text-center">
			<MessageSquare class="mb-4 h-12 w-12 text-neutral-600" />
			<p class="text-sm text-neutral-400">
				No annotations yet. Select text and highlight to add one.
			</p>
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto p-2">
			{#each sortedAnnotations as annotation (annotation.id)}
				<AnnotationItem
					{annotation}
					isActive={annotation.page === currentPage}
					onClick={() => handleAnnotationClick(annotation)}
					onDelete={() => handleDeleteAnnotation(annotation.id)}
				/>
			{/each}
		</div>
	{/if}
</div>
