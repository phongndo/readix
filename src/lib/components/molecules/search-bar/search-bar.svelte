<script lang="ts" module>
	import SearchInput from '$lib/components/atoms/search-input/search-input.svelte';

	export interface SearchBarProps {
		value?: string;
		resultCount?: number;
		placeholder?: string;
		onInput: (value: string) => void;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		value = $bindable(''),
		resultCount,
		placeholder = 'Search books...',
		onInput,
		class: className
	}: SearchBarProps = $props();
</script>

<div class="flex items-center gap-4 {className}">
	<SearchInput bind:value {placeholder} {onInput} class="flex-1" />
	{#if resultCount !== undefined}
		<span class="text-sm text-muted-foreground whitespace-nowrap">
			{resultCount} result{resultCount === 1 ? '' : 's'}
		</span>
	{/if}
</div>
