<script lang="ts">
	import type { BookmarkColor } from '$lib/services/bookmarkService';

	export interface ColorPickerProps {
		selected: BookmarkColor;
		onSelect: (color: BookmarkColor) => void;
	}

	const { selected, onSelect }: ColorPickerProps = $props();

	const colors: { id: BookmarkColor; class: string; label: string }[] = [
		{ id: 'yellow', class: 'bg-yellow-500', label: 'Yellow' },
		{ id: 'green', class: 'bg-green-500', label: 'Green' },
		{ id: 'blue', class: 'bg-blue-500', label: 'Blue' },
		{ id: 'pink', class: 'bg-pink-500', label: 'Pink' },
		{ id: 'purple', class: 'bg-purple-500', label: 'Purple' }
	];
</script>

<div class="flex items-center gap-2" role="group" aria-label="Select bookmark color">
	{#each colors as color (color.id)}
		<button
			type="button"
			onclick={() => onSelect(color.id)}
			class="h-8 w-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 {color.class} {selected ===
			color.id
				? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900'
				: ''}"
			aria-label="Select {color.label}"
			aria-pressed={selected === color.id}
			title={color.label}
		></button>
	{/each}
</div>
