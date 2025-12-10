import { createPluginRegistration } from '@embedpdf/core';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/svelte';
import { ViewportPluginPackage } from '@embedpdf/plugin-viewport/svelte';
import { ScrollPluginPackage } from '@embedpdf/plugin-scroll/svelte';
import { RenderPluginPackage } from '@embedpdf/plugin-render/svelte';
import { ZoomPluginPackage } from '@embedpdf/plugin-zoom/svelte';
import { InteractionManagerPluginPackage } from '@embedpdf/plugin-interaction-manager/svelte';
import { SelectionPluginPackage } from '@embedpdf/plugin-selection/svelte';
import { PanPluginPackage } from '@embedpdf/plugin-pan/svelte';
export interface PDFLoadOptions {
	id: string;
	url: string;
}
export function createPdfPlugins(options: PDFLoadOptions) {
	return [
		createPluginRegistration(LoaderPluginPackage, {
			loadingOptions: {
				type: 'url',
				pdfFile: { id: options.id, url: options.url }
			}
		}),
		createPluginRegistration(ViewportPluginPackage),
		createPluginRegistration(ScrollPluginPackage),
		createPluginRegistration(RenderPluginPackage),
		createPluginRegistration(ZoomPluginPackage),
		createPluginRegistration(InteractionManagerPluginPackage),
		createPluginRegistration(SelectionPluginPackage),
		createPluginRegistration(PanPluginPackage, { defaultMode: 'mobile' })
	];
}
// Re-export commonly used types
export type { RenderPageProps } from '@embedpdf/plugin-scroll/svelte';
