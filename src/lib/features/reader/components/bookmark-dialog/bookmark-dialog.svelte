<script lang="ts">
	import { Bookmark } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ColorPicker from '$lib/components/molecules/color-picker/color-picker.svelte';
	import type { BookmarkColor } from '$lib/services/bookmarkService';

	export interface BookmarkDialogProps {
		open: boolean;
		page: number;
		onSave: (color: BookmarkColor) => void;
		onCancel: () => void;
	}

	const { open, page, onSave, onCancel }: BookmarkDialogProps = $props();

	let selectedColor = $state<BookmarkColor>('yellow');

	function handleSave() {
		onSave(selectedColor);
		selectedColor = 'yellow'; // Reset for next time
	}

	function handleCancel() {
		selectedColor = 'yellow'; // Reset
		onCancel();
	}
</script>

<Dialog.Root {open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
		<Dialog.Content
			class="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-xl"
		>
			<div class="mb-6 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
					<Bookmark class="h-5 w-5 text-yellow-500" />
				</div>
				<div>
					<Dialog.Title class="text-lg font-semibold text-white">Add Bookmark</Dialog.Title>
					<Dialog.Description class="text-sm text-neutral-400">
						Save your place on page {page}
					</Dialog.Description>
				</div>
			</div>

			<div class="mb-6 space-y-3">
				<span class="text-sm font-medium text-neutral-300">Choose a color:</span>
				<ColorPicker selected={selectedColor} onSelect={(color) => (selectedColor = color)} />
			</div>

			<div class="flex justify-end gap-2">
				<Button variant="ghost" onclick={handleCancel}>Cancel</Button>
				<Button variant="primary" onclick={handleSave}>Save Bookmark</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
