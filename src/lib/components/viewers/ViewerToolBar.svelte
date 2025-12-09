<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import ZoomControls from './controls/ZoomControls.svelte';
	import SearchControls from './controls/SearchControls.svelte';

	let pdfTitle: string = 'I love ariel';
</script>

<AppBar class="sticky top-0 z-50">
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
		<AppBar.Headline>
			<p class="text-2xl">{pdfTitle}</p>
		</AppBar.Headline>
		<AppBar.Lead>
			<SearchControls />
		</AppBar.Lead>
		<AppBar.Trail>
			<ZoomControls />
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
