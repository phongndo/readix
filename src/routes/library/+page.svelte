<script lang="ts">
	import LibraryContainer from '$lib/features/library/LibraryContainer.svelte';

	let { data } = $props();
</script>

<LibraryContainer {data} />
