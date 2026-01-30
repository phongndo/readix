<script lang="ts" module>
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

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			onInput(target.value);
		}, debounceMs);
	}

	function clear() {
		value = '';
		onInput('');
	}
</script>

<div class="relative {className}">
	<input
		type="text"
		bind:value
		{placeholder}
		class="w-full rounded-md border bg-background px-9 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
		oninput={handleInput}
	/>
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
