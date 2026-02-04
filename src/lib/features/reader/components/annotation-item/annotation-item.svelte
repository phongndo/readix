<script lang="ts">
	import { Option } from 'effect';
	import { X } from '@lucide/svelte';
	import type { Annotation } from '$lib/domain/reading/ReadingPosition';

	export interface AnnotationItemProps {
		annotation: Annotation;
		isActive: boolean;
		onClick: () => void;
		onDelete: () => void;
	}

	const { annotation, isActive, onClick, onDelete }: AnnotationItemProps = $props();

	const colorClasses: Record<string, string> = {
		yellow: 'bg-yellow-500',
		green: 'bg-green-500',
		blue: 'bg-blue-500',
		pink: 'bg-pink-500',
		purple: 'bg-purple-500'
	};

	const hasNote = $derived(Option.isSome(annotation.note));
	const noteText = $derived(hasNote ? Option.getOrNull(annotation.note) : null);

	// Truncate note text to 60 characters
	const truncatedNote = $derived(
		noteText ? (noteText.length > 60 ? noteText.slice(0, 60) + '...' : noteText) : null
	);
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
	class="group flex w-full cursor-pointer flex-col gap-1 rounded-md px-3 py-2 text-left transition-colors hover:bg-neutral-800 {isActive
		? 'bg-neutral-800'
		: ''}"
	data-active={isActive}
>
	<div class="flex w-full items-center gap-3">
		<!-- Color indicator -->
		<div class="flex h-5 w-5 shrink-0 items-center justify-center">
			<div class="h-3 w-3 rounded-full {colorClasses[annotation.color] || 'bg-yellow-500'}"></div>
		</div>

		<!-- Page number -->
		<span class="shrink-0 text-xs text-neutral-500">
			p. {annotation.page}
		</span>

		<!-- Note preview or fallback -->
		<span class="flex-1 truncate text-sm text-neutral-200">
			{#if truncatedNote}
				{truncatedNote}
			{:else}
				<span class="italic text-neutral-500">Highlight on page {annotation.page}</span>
			{/if}
		</span>

		<!-- Delete button (visible on hover) -->
		<button
			onclick={(e) => {
				e.stopPropagation();
				onDelete();
			}}
			class="opacity-0 transition-opacity group-hover:opacity-100"
			aria-label="Delete annotation"
			type="button"
		>
			<X class="h-4 w-4 text-neutral-500 hover:text-red-400" />
		</button>
	</div>

	<!-- Highlighted text preview (if no note) -->
	{#if !truncatedNote && annotation.highlightedText}
		<div class="ml-8 truncate text-xs text-neutral-500">
			"{annotation.highlightedText.slice(0, 50)}{annotation.highlightedText.length > 50
				? '...'
				: ''}"
		</div>
	{/if}
</div>
