<script lang="ts" module>
	import type { Component } from 'svelte';
	import { cn } from '$lib/classnames.js';
	import CardContainer from '$lib/components/atoms/card-container/card-container.svelte';

	export interface StatCardProps {
		icon: Component;
		value: string | number;
		label: string;
		color?: string;
		suffix?: string;
		onClick?: () => void;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		icon: Icon,
		value,
		label,
		color = 'text-primary',
		suffix = '',
		onClick,
		class: className
	}: StatCardProps = $props();
</script>

<CardContainer
	variant={onClick ? 'interactive' : 'default'}
	padding="sm"
	class={cn(className)}
	onclick={onClick}
>
	<div class="flex items-center gap-3">
		<div class="rounded-full bg-muted p-2">
			<Icon class={cn('h-5 w-5', color)} />
		</div>
		<div>
			<p class="text-2xl font-bold">{value}{suffix}</p>
			<p class="text-xs text-muted-foreground">{label}</p>
		</div>
	</div>
</CardContainer>
