<script lang="ts">
	import { SignedIn } from 'svelte-clerk';
	import LibraryContainer from '$lib/features/library/LibraryContainer.svelte';

	let { data } = $props();
</script>

<SignedIn>
	<LibraryContainer {data} />
</SignedIn>
