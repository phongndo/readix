<script lang="ts" module>
	import { Highlighter, MessageSquare, X } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	export interface AnnotationToolbarProps {
		selectedText: string;
		onHighlight: (color: string) => void;
		onAddNote: () => void;
		onCancel: () => void;
		position?: { x: number; y: number };
	}

	const HIGHLIGHT_COLORS = [
		{ name: 'yellow', class: 'bg-yellow-400', label: 'Yellow' },
		{ name: 'green', class: 'bg-green-400', label: 'Green' },
		{ name: 'blue', class: 'bg-blue-400', label: 'Blue' },
		{ name: 'pink', class: 'bg-pink-400', label: 'Pink' },
		{ name: 'purple', class: 'bg-purple-400', label: 'Purple' }
	] as const;
</script>

<script lang="ts">
	let { selectedText, onHighlight, onAddNote, onCancel, position }: AnnotationToolbarProps =
		$props();

	let showNoteInput = $state(false);
	let noteText = $state('');
</script>

{#if showNoteInput}
	<!-- Note Input Dialog -->
	<div
		class="absolute z-50 min-w-[300px] rounded-lg border bg-popover p-4 shadow-lg"
		style={position ? `left: ${position.x}px; top: ${position.y}px;` : ''}
	>
		<div class="mb-3 flex items-center justify-between">
			<span class="font-medium">Add Note</span>
			<Button variant="ghost" size="icon-sm" onclick={() => (showNoteInput = false)}>
				<X class="h-4 w-4" />
			</Button>
		</div>
		<textarea
			bind:value={noteText}
			placeholder="Enter your note..."
			class="mb-3 min-h-[100px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
		></textarea>
		<div class="flex justify-end gap-2">
			<Button variant="outline" size="sm" onclick={() => (showNoteInput = false)}>Cancel</Button>
			<Button
				size="sm"
				onclick={() => {
					onAddNote();
					showNoteInput = false;
					noteText = '';
				}}>Save Note</Button
			>
		</div>
	</div>
{:else}
	<!-- Highlight Toolbar -->
	<div
		class="absolute z-50 flex items-center gap-1 rounded-lg border bg-popover p-2 shadow-lg"
		style={position ? `left: ${position.x}px; top: ${position.y}px;` : ''}
	>
		<span class="mr-2 text-xs text-muted-foreground">{selectedText.slice(0, 20)}...</span>

		{#each HIGHLIGHT_COLORS as color (color.name)}
			<Button
				variant="ghost"
				size="icon-sm"
				class="h-7 w-7 rounded-full {color.class}"
				onclick={() => onHighlight(color.name)}
				aria-label="Highlight {color.label}"
			>
				<Highlighter class="h-3.5 w-3.5 text-black/50" />
			</Button>
		{/each}

		<div class="mx-1 h-4 w-px bg-border"></div>

		<Button
			variant="ghost"
			size="icon-sm"
			onclick={() => (showNoteInput = true)}
			aria-label="Add note"
		>
			<MessageSquare class="h-4 w-4" />
		</Button>

		<Button variant="ghost" size="icon-sm" onclick={onCancel} aria-label="Cancel">
			<X class="h-4 w-4" />
		</Button>
	</div>
{/if}
