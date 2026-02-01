import { Effect } from 'effect';
// Use legacy build for SSR compatibility
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import type {
	DocumentHandle,
	DocumentMetadata,
	PageDimensions,
	Point
} from '$lib/features/reader/reader.types';

// Set worker source - will be loaded from static folder
if (typeof window !== 'undefined') {
	pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

/**
 * PDF.js wrapper
 * Handles PDF rendering, text extraction, and coordinate transforms
 */
export class PdfEngine {
	readonly format = 'pdf' as const;
	private pdfDocument: pdfjs.PDFDocumentProxy | null = null;
	private loadedPages: Map<number, pdfjs.PDFPageProxy> = new Map();

	/**
	 * Load PDF from URL or ArrayBuffer
	 */
	load(source: string | ArrayBuffer): Effect.Effect<DocumentHandle, Error, never> {
		return Effect.tryPromise({
			try: async () => {
				const loadingTask = pdfjs.getDocument(source);
				this.pdfDocument = await loadingTask.promise;

				// Get metadata using the getMetadata method
				const metadataResult = await this.pdfDocument.getMetadata();
				const metadata: DocumentMetadata = {
					title: metadataResult.metadata?.get('Title') || undefined,
					author: metadataResult.metadata?.get('Author') || undefined,
					creationDate: metadataResult.metadata?.get('CreationDate')
						? new Date(metadataResult.metadata.get('CreationDate'))
						: undefined
				};

				return {
					engine: this as unknown as DocumentHandle['engine'],
					totalPages: this.pdfDocument.numPages,
					metadata
				};
			},
			catch: (error) => new Error(`Failed to load PDF: ${error}`)
		});
	}

	/**
	 * Render a single page to canvas with high quality
	 * Uses devicePixelRatio for sharp rendering on Retina displays
	 */
	renderPage(
		pageNum: number,
		container: HTMLElement,
		baseScale = 1.5
	): Effect.Effect<void, Error, never> {
		return Effect.tryPromise({
			try: async () => {
				if (!this.pdfDocument) {
					throw new Error('PDF not loaded');
				}

				// Clear container
				container.innerHTML = '';

				// Get or load page
				let page = this.loadedPages.get(pageNum);
				if (!page) {
					page = await this.pdfDocument.getPage(pageNum);
					this.loadedPages.set(pageNum, page);
				}

				// Create canvas
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				if (!context) {
					throw new Error('Could not get canvas context');
				}

				// Calculate high-quality render scale
				// Combine base scale with device pixel ratio for crisp text
				const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
				const renderScale = baseScale * dpr;

				// Calculate viewport at high resolution
				const viewport = page.getViewport({ scale: renderScale });

				// Set canvas size to high-resolution render size
				canvas.width = viewport.width;
				canvas.height = viewport.height;

				// Set CSS display size to logical size (scaled down by DPR)
				// This makes the canvas appear at the correct size while being high-res
				canvas.style.width = `${viewport.width / dpr}px`;
				canvas.style.height = `${viewport.height / dpr}px`;

				// Render PDF page to canvas at high resolution
				await page.render({
					canvasContext: context,
					viewport,
					canvas: canvas as HTMLCanvasElement
				}).promise;

				container.appendChild(canvas);
			},
			catch: (error) => new Error(`Failed to render page ${pageNum}: ${error}`)
		});
	}

	/**
	 * Extract text content from a page
	 */
	getTextContent(pageNum: number): Effect.Effect<string, Error, never> {
		return Effect.tryPromise({
			try: async () => {
				if (!this.pdfDocument) {
					throw new Error('PDF not loaded');
				}

				const page = await this.pdfDocument.getPage(pageNum);
				const textContent = await page.getTextContent();

				return textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
			},
			catch: (error) => new Error(`Failed to extract text from page ${pageNum}: ${error}`)
		});
	}

	/**
	 * Get total number of pages
	 */
	getTotalPages(): number {
		return this.pdfDocument?.numPages || 0;
	}

	/**
	 * Get page dimensions
	 */
	getPageDimensions(pageNum: number): Effect.Effect<PageDimensions, Error, never> {
		return Effect.tryPromise({
			try: async () => {
				if (!this.pdfDocument) {
					throw new Error('PDF not loaded');
				}

				const page = await this.pdfDocument.getPage(pageNum);
				const viewport = page.getViewport({ scale: 1.0 });

				return {
					width: viewport.width,
					height: viewport.height
				};
			},
			catch: (error) => new Error(`Failed to get dimensions for page ${pageNum}: ${error}`)
		});
	}

	/**
	 * Convert screen coordinates to PDF page coordinates
	 */
	convertPointToPage(
		x: number,
		y: number,
		pageNum: number
	): Effect.Effect<Point | null, Error, never> {
		return Effect.tryPromise({
			try: async () => {
				if (!this.pdfDocument) {
					throw new Error('PDF not loaded');
				}

				const page = await this.pdfDocument.getPage(pageNum);
				const viewport = page.getViewport({ scale: 1.0 });

				// Convert DOM coordinates to PDF coordinates
				// This is a simplified version - in reality you'd need
				// to account for scroll position and scale
				const pdfX = x / viewport.scale;
				const pdfY = (viewport.height - y) / viewport.scale;

				return { x: pdfX, y: pdfY };
			},
			catch: (error) => new Error(`Failed to convert point for page ${pageNum}: ${error}`)
		});
	}

	/**
	 * Cleanup resources
	 */
	cleanup(): void {
		// Cleanup loaded pages
		for (const page of this.loadedPages.values()) {
			page.cleanup();
		}
		this.loadedPages.clear();

		// Cleanup document
		if (this.pdfDocument) {
			this.pdfDocument.destroy();
			this.pdfDocument = null;
		}
	}
}
