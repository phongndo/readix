<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { TextPosition } from '$lib/features/reader/reader.types';

	export interface TextLayerProps {
		page: number;
		scale: number;
		onTextSelect: (selection: { text: string; position: TextPosition }) => void;
		children: Snippet;
	}
</script>

<script lang="ts">
	let { page, scale, onTextSelect, children }: TextLayerProps = $props();

	let textLayerRef = $state<HTMLDivElement | null>(null);

	function handleSelection() {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !textLayerRef) return;

		const range = selection.getRangeAt(0);
		const selectedText = selection.toString().trim();

		if (!selectedText) return;

		// Get bounding client rect of selection
		const rects = range.getClientRects();
		const containerRect = textLayerRef.getBoundingClientRect();

		const boundingBoxes = Array.from(rects).map((rect) => ({
			x: (rect.left - containerRect.left) / scale,
			y: (rect.top - containerRect.top) / scale,
			width: rect.width / scale,
			height: rect.height / scale
		}));

		// Get character offsets (approximate)
		const preSelectionRange = document.createRange();
		preSelectionRange.selectNodeContents(textLayerRef);
		preSelectionRange.setEnd(range.startContainer, range.startOffset);
		const startOffset = preSelectionRange.toString().length;
		const endOffset = startOffset + selectedText.length;

		onTextSelect({
			text: selectedText,
			position: {
				startOffset,
				endOffset,
				boundingBoxes
			}
		});
	}

	function handleMouseUp() {
		// Small delay to let selection finalize
		setTimeout(handleSelection, 10);
	}
</script>

<div
	bind:this={textLayerRef}
	class="absolute inset-0 select-text"
	role="textbox"
	tabindex="0"
	aria-label="Text content for page {page}"
	onmouseup={handleMouseUp}
	onkeyup={(e) => {
		if (e.key === 'Shift' && window.getSelection()?.toString()) {
			handleSelection();
		}
	}}
>
	<!-- Text spans will be rendered here by pdf-engine.renderTextLayer -->
	{@render children()}
</div>
