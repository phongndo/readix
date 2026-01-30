<script lang="ts" module>
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils.js';

	export type IconCircleVariant = 'default' | 'primary' | 'accent';
	export type IconCircleSize = 'sm' | 'md' | 'lg';

	export interface IconCircleProps {
		icon: Component;
		variant?: IconCircleVariant;
		size?: IconCircleSize;
		color?: string;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		icon: Icon,
		variant = 'default',
		size = 'md',
		color = 'text-primary',
		class: className
	}: IconCircleProps = $props();

	const sizeClasses = {
		sm: 'h-8 w-8 p-1.5',
		md: 'h-10 w-10 p-2',
		lg: 'h-12 w-12 p-2.5'
	};

	const variantClasses = {
		default: 'bg-neutral-800',
		primary: 'bg-red-500/10',
		accent: 'bg-transparent border border-neutral-700'
	};
</script>

<div
	class={cn(
		'flex items-center justify-center',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
>
	<Icon class={cn('h-full w-full', color)} />
</div>
