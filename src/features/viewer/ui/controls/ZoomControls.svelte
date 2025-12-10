<script lang="ts">
	import { useZoom } from '@embedpdf/plugin-zoom/svelte';
	// useZoom returns a plain object, not a Svelte store
	const zoom = useZoom();
</script>

{#if zoom.provides}
	<div>
		<span>
			Zoom: {Math.round(zoom.state.currentZoomLevel * 100)}%
		</span>
		<button
			type="button"
			class="btn btn-xs variant-ghost"
			on:click={() => zoom.provides?.zoomOut()}
		>
			-
		</button>
		<button type="button" class="btn btn-xs variant-ghost" on:click={() => zoom.provides?.zoomIn()}>
			+
		</button>
		<button
			type="button"
			class="btn btn-xs variant-ghost"
			on:click={() => zoom.provides?.requestZoom(1.0)}
		>
			Reset
		</button>
	</div>
{/if}
