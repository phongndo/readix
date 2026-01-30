<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	export interface ProgressBarProps {
		value: number;
		max?: number;
		variant?: 'default' | 'secondary' | 'thin';
		size?: 'sm' | 'md' | 'lg';
		animated?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		value,
		max = 100,
		variant = 'default',
		size = 'md',
		animated = false,
		class: className
	}: ProgressBarProps = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

	const sizeClasses = {
		sm: 'h-1',
		md: 'h-2',
		lg: 'h-3'
	};

	const variantClasses = {
		default: 'bg-red-500',
		secondary: 'bg-neutral-600',
		thin: 'bg-red-500'
	};

	const trackClasses = {
		default: 'bg-neutral-800',
		secondary: 'bg-neutral-700',
		thin: 'bg-neutral-800'
	};
</script>

<div class={cn('w-full overflow-hidden', trackClasses[variant], sizeClasses[size], className)}>
	<div
		class={cn(
			'h-full transition-all duration-300',
			variantClasses[variant],
			animated && 'animate-pulse'
		)}
		style="width: {percentage}%"
	></div>
</div>
