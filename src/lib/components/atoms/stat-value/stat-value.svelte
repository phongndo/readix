<script lang="ts" module>
	import type { Component } from 'svelte';
	import { cn } from '$lib/classnames.js';

	export type StatValueVariant = 'default' | 'compact' | 'horizontal';

	export interface StatValueProps {
		icon: Component;
		value: string | number;
		label: string;
		color?: string;
		variant?: StatValueVariant;
		suffix?: string;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		icon: Icon,
		value,
		label,
		color = 'text-primary',
		variant = 'default',
		suffix = '',
		class: className
	}: StatValueProps = $props();

	const variantClasses = {
		default: 'flex-col',
		compact: 'flex-col scale-90',
		horizontal: 'flex-row items-center gap-4'
	};
</script>

<div class={cn('flex', variantClasses[variant], className)}>
	<div class="flex items-center gap-3">
		<div class="rounded-full bg-muted p-2">
			<Icon class={cn('h-5 w-5', color)} />
		</div>
		<div>
			<p class="text-2xl font-bold">{value}{suffix}</p>
			<p class="text-xs text-muted-foreground">{label}</p>
		</div>
	</div>
</div>
