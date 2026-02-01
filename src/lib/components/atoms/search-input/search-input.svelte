<script lang="ts" module>
	import Input from '$lib/components/ui/input/input.svelte';

	export interface SearchInputProps {
		value?: string;
		placeholder?: string;
		debounceMs?: number;
		onInput: (value: string) => void;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = 'Search...',
		debounceMs = 300,
		onInput,
		class: className
	}: SearchInputProps = $props();

	let timeoutId: ReturnType<typeof setTimeout>;

	function handleInput(inputValue: string) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			onInput(inputValue);
		}, debounceMs);
	}

	function clear() {
		value = '';
		onInput('');
	}
</script>

<div class="relative {className}">
	<Input type="search" bind:value {placeholder} class="pl-9" oninput={handleInput} />
	<svg
		class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width={2}
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>
	{#if value}
		<button
			type="button"
			onclick={clear}
			aria-label="Clear search"
			class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
		>
			<svg
				class="h-3 w-3"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width={2}
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	{/if}
</div>
