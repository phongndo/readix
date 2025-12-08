<script lang="ts">
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import ZoomControls from './controls/ZoomControls.svelte';
  import SearchControls from './controls/SearchControls.svelte';
</script>
 
<AppBar>
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
		<AppBar.Lead>
      <SearchControls />
		</AppBar.Lead>
		<AppBar.Headline>
			<p class="text-2xl">Title of pdf</p>
		</AppBar.Headline>
		<AppBar.Trail>
      <ZoomControls />
  </AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
