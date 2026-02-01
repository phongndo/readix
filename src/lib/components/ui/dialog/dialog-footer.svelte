<script lang="ts" module>
	import { cn } from '$lib/classnames.js';
	import type { Snippet } from 'svelte';

	export interface DialogFooterProps {
		class?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	let { class: className, children }: DialogFooterProps = $props();
</script>

<div class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
	{@render children()}
</div>
