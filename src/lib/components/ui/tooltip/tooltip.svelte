<script lang="ts" module>
	import { Tooltip as BitsTooltip } from 'bits-ui';
	import { cn } from '$lib/classnames.js';
	import type { Snippet } from 'svelte';

	export interface TooltipProps {
		content: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		delay?: number;
		class?: string;
		children: Snippet;
	}

	export { BitsTooltip as TooltipRoot };
</script>

<script lang="ts">
	let {
		content,
		position = 'top',
		delay = 300,
		class: className,
		children
	}: TooltipProps = $props();

	const positionClasses = {
		top: 'mb-2',
		bottom: 'mt-2',
		left: 'mr-2',
		right: 'ml-2'
	};
</script>

<BitsTooltip.Root delayDuration={delay}>
	<BitsTooltip.Trigger class={cn('inline-flex', className)}>
		{@render children()}
	</BitsTooltip.Trigger>
	<BitsTooltip.Portal>
		<BitsTooltip.Content
			side={position}
			sideOffset={4}
			class={cn(
				'z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
				positionClasses[position]
			)}
		>
			{content}
			<BitsTooltip.Arrow class="fill-border" />
		</BitsTooltip.Content>
	</BitsTooltip.Portal>
</BitsTooltip.Root>
