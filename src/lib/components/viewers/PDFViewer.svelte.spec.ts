import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PDFViewer from './PDFViewer.svelte';

// Mock the PDF engine hook so the real engine never initializes
vi.mock('@embedpdf/engines/svelte', () => ({
	usePdfiumEngine: () => ({
		isLoading: true,
		engine: null
	})
}));

describe('PDFViewer', () => {
	it('shows loading pane while engine is loading', async () => {
		render(PDFViewer);

		const loading = page.getByText('Loading PDF Engine...');
		await expect.element(loading).toBeInTheDocument();
	});
});
