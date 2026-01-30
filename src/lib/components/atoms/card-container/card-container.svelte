<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	export type CardContainerVariant = 'default' | 'interactive' | 'flat';
	export type CardContainerPadding = 'sm' | 'md' | 'lg';

	export interface CardContainerProps {
		variant?: CardContainerVariant;
		padding?: CardContainerPadding;
		class?: string;
		children?: Snippet;
		onclick?: () => void;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		padding = 'md',
		class: className,
		children,
		onclick
	}: CardContainerProps = $props();

	const paddingClasses = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	const variantClasses = {
		default: 'rounded-lg border bg-card',
		interactive: 'rounded-lg border bg-card transition-colors hover:bg-accent/50 cursor-pointer',
		flat: 'rounded-lg bg-card'
	};

	const interactiveAttrs = $derived(onclick ? { role: 'button', tabindex: 0 } : {});
</script>

<div
	class={cn(variantClasses[variant], paddingClasses[padding], className)}
	{onclick}
	{...interactiveAttrs}
>
	{@render children?.()}
</div>
