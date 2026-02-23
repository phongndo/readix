<script lang="ts">
	import ReaderContainer from '$lib/features/reader/ReaderContainer.svelte';

	let { data } = $props();
</script>

<ReaderContainer {data} />
