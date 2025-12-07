<script lang="ts">
import { usePdfiumEngine } from '@embedpdf/engines/svelte';
import { EmbedPDF } from '@embedpdf/core/svelte';
import ViewerToolBar from './ViewerToolBar.svelte';
import { createPluginRegistration } from '@embedpdf/core';
import { ZoomPluginPackage } from '@embedpdf/plugin-zoom/svelte';
 
// Import the essential plugins and their components
import { ViewportPluginPackage, Viewport } from '@embedpdf/plugin-viewport/svelte';
import { Scroller, ScrollPluginPackage, type RenderPageProps } from '@embedpdf/plugin-scroll/svelte';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/svelte';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/svelte';
import { PagePointerProvider, InteractionManagerPluginPackage } from '@embedpdf/plugin-interaction-manager/svelte'
import { SelectionLayer, SelectionPluginPackage } from '@embedpdf/plugin-selection/svelte';
import { PanPluginPackage } from '@embedpdf/plugin-pan/svelte';
 
// 1. Initialize the engine with the Svelte store
const pdfEngine = usePdfiumEngine();
 
// 2. Register the plugins you need
const plugins = [
  createPluginRegistration(LoaderPluginPackage, {
    loadingOptions: {
      type: 'url',
      pdfFile: {
        id: 'example-pdf',
        url: 'https://snippet.embedpdf.com/ebook.pdf',
      },
    },
  }),
  createPluginRegistration(ViewportPluginPackage),
  createPluginRegistration(ScrollPluginPackage),
  createPluginRegistration(RenderPluginPackage),
  createPluginRegistration(ZoomPluginPackage),
  createPluginRegistration(InteractionManagerPluginPackage),
  createPluginRegistration(SelectionPluginPackage),
  createPluginRegistration(PanPluginPackage, {
    defaultMode: 'mobile'
  }),

];
</script>
 
{#snippet RenderPageSnippet(page: RenderPageProps)}
  <div style:width="{page.width}px" style:height="{page.height}px" style:position="relative">
    <PagePointerProvider 
      pageIndex={page.pageIndex} 
      pageWidth={page.width} 
      pageHeight={page.height}
      scale={page.scale}
      rotation={page.rotation}
    >
      <RenderLayer pageIndex={page.pageIndex} scale={page.scale}/>
      <SelectionLayer pageIndex={page.pageIndex} scale={page.scale} />
    </PagePointerProvider>
  </div>
{/snippet}
 
<div style="height: 800; border: 1px solid black;">
  {#if pdfEngine.isLoading || !pdfEngine.engine}
    <div class="loading-pane">
      Loading PDF Engine...
    </div>
  {:else}
    <EmbedPDF engine={pdfEngine.engine} {plugins}>
      <ViewerToolBar />
      <Viewport class="viewport-class">
        <Scroller {RenderPageSnippet} />
      </Viewport>
    </EmbedPDF>
  {/if}
</div>
 
<style>
  .loading-pane {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
