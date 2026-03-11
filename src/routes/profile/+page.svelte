<script lang="ts">
	import ProfileContainer from '$lib/features/profile/ProfileContainer.svelte';

	let { data } = $props();
</script>

<ProfileContainer {data} />
