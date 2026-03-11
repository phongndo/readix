<script lang="ts">
	import WorkspaceContainer from '$lib/features/workspace/WorkspaceContainer.svelte';

	let { data } = $props();
</script>

<WorkspaceContainer {data} />
