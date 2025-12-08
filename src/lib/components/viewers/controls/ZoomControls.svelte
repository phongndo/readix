<script lang="ts">
import { useZoom } from '@embedpdf/plugin-zoom/svelte';
 
// The function returns a readable Svelte store
const zoom = useZoom();
</script>
 
{#if zoom.provides}
  <div style="padding: 8px; background: #eee; display: flex; gap: 8px; align-items: center;">
    <span>Zoom: {Math.round(zoom.state.currentZoomLevel * 100)}%</span>
    <button onclick={() => zoom.provides?.zoomOut()}>-</button>
    <button onclick={() => zoom.provides?.zoomIn()}>+</button>
    <button onclick={() => zoom.provides?.requestZoom(1.0)}>Reset</button>
  </div>
{/if}
