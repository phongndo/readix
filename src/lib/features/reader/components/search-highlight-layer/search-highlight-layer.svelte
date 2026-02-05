<script lang="ts" module>
	import type { SearchResult } from '$lib/features/reader/reader.types';

	export interface SearchHighlightLayerProps {
		page: number;
		searchResults: SearchResult[];
		scale: number;
	}

	interface BoundingBox {
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface HighlightData {
		id: string;
		boxes: BoundingBox[];
	}
</script>

<script lang="ts">
	let { page, searchResults, scale }: SearchHighlightLayerProps = $props();

	// Get search results for this page
	const pageResults = $derived(searchResults.filter((r) => r.page === page));

	// Calculate highlight positions by re-searching in text layer
	const highlights = $derived(() => {
		const highlightData: HighlightData[] = [];

		// Find the text layer container for this page
		const pageWrapper = document.querySelector(`[data-page="${page}"]`);
		const textLayer = pageWrapper?.querySelector('.text-layer-container');

		if (!textLayer) return highlightData;

		pageResults.forEach((result, index) => {
			// Extract the matching text portion
			const snippet = result.text;

			// Find text spans in the text layer that contain this snippet
			const textSpans = textLayer.querySelectorAll('span');
			const matchingBoxes: BoundingBox[] = [];

			textSpans.forEach((span) => {
				const spanText = span.textContent || '';
				if (
					snippet.toLowerCase().includes(spanText.toLowerCase()) ||
					spanText.toLowerCase().includes(snippet.toLowerCase().slice(0, 20))
				) {
					const rect = span.getBoundingClientRect();
					const containerRect = textLayer.getBoundingClientRect();

					// Convert to relative coordinates and normalize by scale
					matchingBoxes.push({
						x: (rect.left - containerRect.left) / (1.5 * scale),
						y: (rect.top - containerRect.top) / (1.5 * scale),
						width: rect.width / (1.5 * scale),
						height: rect.height / (1.5 * scale)
					});
				}
			});

			if (matchingBoxes.length > 0) {
				highlightData.push({
					id: `search-${page}-${index}`,
					boxes: matchingBoxes
				});
			}
		});

		return highlightData;
	});
</script>

<div class="pointer-events-none absolute inset-0">
	{#each highlights() as highlight (highlight.id)}
		{#each highlight.boxes as box, index (`${highlight.id}-${index}`)}
			<div
				class="absolute bg-orange-500/40 border border-orange-500/60"
				style="left: {box.x * scale}px; top: {box.y * scale}px; width: {box.width *
					scale}px; height: {box.height * scale}px;"
			></div>
		{/each}
	{/each}
</div>
