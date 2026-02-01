<script lang="ts">
	import { SignedIn } from 'svelte-clerk';
	import ReaderContainer from '$lib/features/reader/ReaderContainer.svelte';

	let { data } = $props();
</script>

<SignedIn>
	<ReaderContainer {data} />
</SignedIn>
