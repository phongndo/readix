<script lang="ts">
	import DashboardContainer from '$lib/features/dashboard/DashboardContainer.svelte';

	let { data } = $props();
</script>

<DashboardContainer {data} />
