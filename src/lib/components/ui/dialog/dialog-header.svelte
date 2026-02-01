<script lang="ts" module>
	import { cn } from '$lib/classnames.js';
	import type { Snippet } from 'svelte';

	export interface DialogHeaderProps {
		class?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	let { class: className, children }: DialogHeaderProps = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
	{@render children()}
</div>
