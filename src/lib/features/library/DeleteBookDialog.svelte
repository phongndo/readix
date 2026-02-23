<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import type { DeletePreview } from '$lib/services/bookService';

	let {
		open = $bindable(false),
		bookTitle,
		preview = null,
		previewError = null,
		isLoading = false,
		isDeleting = false,
		onCancel,
		onConfirm
	}: {
		open: boolean;
		bookTitle: string;
		preview: DeletePreview | null;
		previewError: string | null;
		isLoading: boolean;
		isDeleting: boolean;
		onCancel: () => void;
		onConfirm: () => Promise<void>;
	} = $props();

	let confirmationText = $state('');
	const isTitleMatch = $derived(confirmationText.trim() === bookTitle.trim());
	const canDelete = $derived(!isLoading && !isDeleting && isTitleMatch);

	$effect(() => {
		if (open) {
			confirmationText = '';
		}
	});

	async function handleDelete() {
		if (!canDelete) return;
		await onConfirm();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/60" />
		<Dialog.Content
			class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-card p-6 shadow-lg"
		>
			<DialogHeader class="mb-4">
				<Dialog.Title class="text-lg font-semibold">Delete Book Permanently</Dialog.Title>
				<Dialog.Description class="text-sm text-muted-foreground">
					This action cannot be undone.
				</Dialog.Description>
			</DialogHeader>

			<div class="space-y-4">
				<div class="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
					<p class="font-medium">{bookTitle}</p>
					<p class="mt-1">All linked reading data will be permanently removed.</p>
				</div>

				{#if isLoading}
					<p class="text-sm text-muted-foreground">Preparing deletion preview...</p>
				{:else if previewError}
					<p class="text-sm text-red-500">{previewError}</p>
				{:else if preview}
					<div class="rounded-md border bg-muted/40 p-3">
						<p class="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
							Records To Delete ({preview.totalRecords})
						</p>
						<div class="grid grid-cols-2 gap-2 text-sm">
							<p>Book content: {preview.counts.bookContent}</p>
							<p>Document text: {preview.counts.documentText}</p>
							<p>Positions: {preview.counts.readingPositions}</p>
							<p>Bookmarks: {preview.counts.bookmarks}</p>
							<p>Annotations: {preview.counts.annotations}</p>
							<p>Sessions: {preview.counts.readingSessions}</p>
						</div>
						{#if preview.hasStoredFile}
							<p class="mt-2 text-xs text-muted-foreground">
								Stored file: {preview.fileName ?? 'PDF file'} will also be removed.
							</p>
						{/if}
					</div>
				{/if}

				<div class="space-y-2">
					<p class="text-sm text-muted-foreground">
						Type <span class="font-mono text-foreground">{bookTitle}</span> to confirm deletion.
					</p>
					<Input
						value={confirmationText}
						oninput={(value) => (confirmationText = value)}
						placeholder="Enter exact book title"
					/>
				</div>
			</div>

			<div class="mt-6 flex gap-2">
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					disabled={isDeleting}
					onclick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					class="flex-1"
					disabled={!canDelete}
					onclick={handleDelete}
				>
					{#if isDeleting}
						Deleting...
					{:else}
						Delete Permanently
					{/if}
				</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
