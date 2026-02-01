<script lang="ts" module>
	import { cn } from '$lib/classnames.js';

	export interface DashboardLayoutProps {
		class?: string;
		header?: Snippet;
		stats?: Snippet;
		content?: Snippet;
		sidebar?: Snippet;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className, header, stats, content, sidebar }: DashboardLayoutProps = $props();
</script>

<div class={cn('space-y-6', className)}>
	<!-- Welcome Header -->
	{#if header}
		<div class="mb-6">
			{@render header()}
		</div>
	{/if}

	<!-- Stats Section -->
	{#if stats}
		<div class="mb-6">
			{@render stats()}
		</div>
	{/if}

	<!-- Main Content Area -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Primary Content -->
		<div class="lg:col-span-2 space-y-6">
			{#if content}
				{@render content()}
			{/if}
		</div>

		<!-- Sidebar -->
		{#if sidebar}
			<div class="space-y-6">
				{@render sidebar()}
			</div>
		{/if}
	</div>
</div>
