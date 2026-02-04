<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ClerkProvider } from 'svelte-clerk';
	import { Tooltip } from 'bits-ui';
	import MainHeader from '$lib/components/organisms/main-header/main-header.svelte';
	import ToastContainer from '$lib/components/molecules/toast-container/toast-container.svelte';
	import './layout.css';
	const { children }: { children: Snippet } = $props();
</script>

<ClerkProvider>
	<Tooltip.Provider>
		<MainHeader />
		{@render children()}
		<ToastContainer />
	</Tooltip.Provider>
</ClerkProvider>
