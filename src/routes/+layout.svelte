<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ClerkProvider } from 'svelte-clerk';
	import './layout.css';
	const { children }: { children: Snippet } = $props();
</script>

<ClerkProvider>
	{@render children()}
</ClerkProvider>
