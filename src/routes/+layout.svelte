<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ClerkProvider } from 'svelte-clerk';
	import { Tooltip } from 'bits-ui';
	import MainHeader from '$lib/components/organisms/main-header/main-header.svelte';
	import './layout.css';
	const { children }: { children: Snippet } = $props();
</script>

<ClerkProvider>
	<Tooltip.Provider>
		<MainHeader />
		{@render children()}
	</Tooltip.Provider>
</ClerkProvider>
