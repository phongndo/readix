<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	export interface PageLayoutProps {
		class?: string;
		children: Snippet;
		headerLeft?: Snippet;
		headerRight?: Snippet;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className, children, headerLeft, headerRight }: PageLayoutProps = $props();
</script>

<div class={cn('min-h-screen bg-background', className)}>
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="container mx-auto flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				{@render headerLeft?.()}
			</div>
			<div class="flex items-center gap-4">
				{@render headerRight?.()}
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-6">
		{@render children()}
	</main>
</div>
