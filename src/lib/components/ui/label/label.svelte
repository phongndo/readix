<script lang="ts" module>
	import { cn } from '$lib/classnames.js';

	export interface LabelProps {
		for?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	import { Label as BitsLabel } from 'bits-ui';

	let { for: htmlFor, class: className, children }: LabelProps = $props();
</script>

<BitsLabel.Root
	for={htmlFor}
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
>
	{@render children?.()}
</BitsLabel.Root>
