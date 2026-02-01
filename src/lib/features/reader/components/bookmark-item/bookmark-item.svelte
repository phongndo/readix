<script lang="ts">
	import { Option } from 'effect';
	import { Bookmark, X } from '@lucide/svelte';
	import type { BookmarkItemProps } from '$lib/features/reader/reader.types';

	let { bookmark, isActive, onClick, onDelete }: BookmarkItemProps = $props();

	const colorClasses: Record<string, string> = {
		yellow: 'bg-yellow-500',
		green: 'bg-green-500',
		blue: 'bg-blue-500',
		pink: 'bg-pink-500',
		purple: 'bg-purple-500'
	};

	const hasColor = $derived(Option.isSome(bookmark.color));
	const colorValue = $derived(hasColor ? Option.getOrNull(bookmark.color) : null);
</script>

<div
	role="button"
	tabindex="0"
	onclick={onClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick();
		}
	}}
	class="group flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-800 {isActive
		? 'bg-neutral-800'
		: ''}"
	data-active={isActive}
>
	<!-- Color indicator or default icon -->
	<div class="flex h-5 w-5 shrink-0 items-center justify-center">
		{#if colorValue}
			<div class="h-3 w-3 rounded-full {colorClasses[colorValue]}"></div>
		{:else}
			<Bookmark class="h-4 w-4 text-neutral-400" />
		{/if}
	</div>

	<!-- Title -->
	<span class="flex-1 truncate text-sm text-neutral-200">
		{bookmark.title}
	</span>

	<!-- Delete button (visible on hover) -->
	<button
		onclick={(e) => {
			e.stopPropagation();
			onDelete();
		}}
		class="opacity-0 transition-opacity group-hover:opacity-100"
		aria-label="Delete bookmark"
		type="button"
	>
		<X class="h-4 w-4 text-neutral-500 hover:text-red-400" />
	</button>
</div>
