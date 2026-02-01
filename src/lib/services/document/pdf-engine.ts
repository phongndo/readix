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
		baseScale = 1.5,
		zoom = 1.0
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
				// Combine base scale with device pixel ratio AND zoom for crisp text at all zoom levels
				// Formula: baseScale (1.5) * dpr (2.0 on Retina) * zoom (user zoom level)
				// Example at 200% zoom on Retina: 1.5 * 2.0 * 2.0 = 6.0x scale = super crisp!
				const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
				const renderScale = baseScale * dpr * zoom;

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
	 * Render invisible text layer for text selection
	 * Creates absolutely positioned span elements matching PDF text layout
	 * Text layer is invisible (transparent) but selectable
	 */
	renderTextLayer(
		pageNum: number,
		container: HTMLElement,
		baseScale = 1.5,
		zoom = 1.0
	): Effect.Effect<
		Array<{
			text: string;
			x: number;
			y: number;
			width: number;
			height: number;
			fontSize: number;
		}>,
		Error,
		never
	> {
		return Effect.tryPromise({
			try: async () => {
				if (!this.pdfDocument) {
					throw new Error('PDF not loaded');
				}

				const page = await this.pdfDocument.getPage(pageNum);
				const textContent = await page.getTextContent();

				// Get viewport at base scale with zoom (matches canvas rendering)
				const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
				const renderScale = baseScale * dpr * zoom;
				const viewport = page.getViewport({ scale: renderScale });

				// Clear container
				container.innerHTML = '';
				container.style.position = 'absolute';
				container.style.top = '0';
				container.style.left = '0';
				container.style.width = `${viewport.width / dpr}px`;
				container.style.height = `${viewport.height / dpr}px`;
				container.style.pointerEvents = 'auto';

				const textItems: Array<{
					text: string;
					x: number;
					y: number;
					width: number;
					height: number;
					fontSize: number;
				}> = [];

				// Create text spans for each text item
				for (const item of textContent.items) {
					if (!('str' in item) || !item.str.trim()) continue;

					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const textItem = item as any;
					const transform = textItem.transform as [number, number, number, number, number, number];

					// Transform matrix: [a, b, c, d, e, f]
					// e = x position, f = y position
					const x = transform[4] / dpr;
					const y = (viewport.height - transform[5]) / dpr;

					// Calculate width and height
					const width = (textItem.width * renderScale) / dpr;
					const height = (textItem.height * renderScale) / dpr;
					const fontSize = Math.abs(transform[3]) / dpr;

					const span = document.createElement('span');
					span.textContent = textItem.str;
					span.style.position = 'absolute';
					span.style.left = `${x}px`;
					span.style.top = `${y - height}px`;
					span.style.fontSize = `${fontSize}px`;
					span.style.lineHeight = '1';
					span.style.whiteSpace = 'pre';
					span.style.color = 'transparent';
					span.style.userSelect = 'text';
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(span.style as any).webkitUserSelect = 'text';

					container.appendChild(span);

					textItems.push({
						text: textItem.str,
						x,
						y: y - height,
						width,
						height,
						fontSize
					});
				}

				return textItems;
			},
			catch: (error) => new Error(`Failed to render text layer for page ${pageNum}: ${error}`)
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
