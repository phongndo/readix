<script lang="ts">
	import { MessageSquare } from '@lucide/svelte';
	import { readerStore } from '$lib/features/reader/reader.store.svelte';
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
		[...readerStore.annotations].sort((a: Annotation, b: Annotation) => a.page - b.page)
	);

	function handleAnnotationClick(page: number) {
		onJumpToPage(page);
	}
</script>

<div class="flex h-full flex-col p-4">
	{#if sortedAnnotations.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center text-center">
			<MessageSquare class="mb-4 h-12 w-12 text-neutral-600" />
			<p class="text-sm text-neutral-400">No annotations yet</p>
		</div>
	{:else}
		<div class="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto">
			{#each sortedAnnotations as annotation (annotation.id)}
				<button
					type="button"
					onclick={() => handleAnnotationClick(annotation.page)}
					class="flex h-10 w-10 items-center justify-center rounded-md transition-colors {annotation.page ===
					currentPage
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
					title="Page {annotation.page}"
				>
					<MessageSquare class="h-4 w-4" />
				</button>
			{/each}
		</div>
	{/if}
</div>
