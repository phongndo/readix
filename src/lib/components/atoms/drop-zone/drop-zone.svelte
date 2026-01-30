<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	export interface DropZoneProps {
		isDragging?: boolean;
		isActive?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
		role?: string;
		ondragover?: (e: DragEvent) => void;
		ondragleave?: (e: DragEvent) => void;
		ondrop?: (e: DragEvent) => void;
	}
</script>

<script lang="ts">
	let {
		isDragging = false,
		isActive = true,
		class: className,
		children,
		role = 'region',
		ondragover,
		ondragleave,
		ondrop
	}: DropZoneProps = $props();
</script>

<div
	class={cn(
		'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
		isActive
			? isDragging
				? 'border-primary bg-primary/5'
				: 'border-muted-foreground/25 hover:border-muted-foreground/50'
			: 'border-muted-foreground/10 opacity-50',
		className
	)}
	{role}
	aria-label="Drop files here"
	{ondragover}
	{ondragleave}
	{ondrop}
>
	{@render children?.()}
</div>
