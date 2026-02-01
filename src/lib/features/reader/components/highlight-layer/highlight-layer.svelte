<script lang="ts" module>
	import type { Annotation } from '$lib/domain/reading/ReadingPosition';

	export interface HighlightLayerProps {
		page: number;
		annotations: Annotation[];
		scale: number;
		onAnnotationClick?: (annotation: Annotation) => void;
	}

	const COLOR_MAP: Record<string, string> = {
		yellow: 'bg-yellow-400/30',
		green: 'bg-green-400/30',
		blue: 'bg-blue-400/30',
		pink: 'bg-pink-400/30',
		purple: 'bg-purple-400/30'
	};

	const DEFAULT_COLOR = 'bg-yellow-400/30';
</script>

<script lang="ts">
	let { page, annotations, scale, onAnnotationClick }: HighlightLayerProps = $props();

	// Filter annotations for this page
	const pageAnnotations = $derived(annotations.filter((a) => a.page === page));
</script>

<div class="pointer-events-none absolute inset-0">
	{#each pageAnnotations as annotation (annotation.id)}
		{#each annotation.position.boundingBoxes as box, index (`${annotation.id}-${index}`)}
			<div
				role="button"
				tabindex="0"
				class="absolute cursor-pointer transition-opacity hover:opacity-80 {COLOR_MAP[
					annotation.color
				] || DEFAULT_COLOR}"
				style="left: {box.x * scale}px; top: {box.y * scale}px; width: {box.width *
					scale}px; height: {box.height * scale}px;"
				onclick={() => onAnnotationClick?.(annotation)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onAnnotationClick?.(annotation);
					}
				}}
			></div>
		{/each}
	{/each}
</div>
