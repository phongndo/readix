const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_QUALITY = 0.85;

function isPdfFile(file: File): boolean {
	return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export interface PdfUploadMetadata {
	thumbnailDataUrl?: string;
	totalPages?: number;
}

/**
 * Extract client-side PDF metadata used during upload.
 * Uses the first page as a thumbnail and reads true PDF page count.
 */
export async function extractPdfUploadMetadata(file: File): Promise<PdfUploadMetadata | undefined> {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return undefined;
	}

	if (!isPdfFile(file)) {
		return undefined;
	}

	const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
	pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

	const fileBuffer = await file.arrayBuffer();
	const loadingTask = pdfjs.getDocument({ data: fileBuffer });
	const pdfDocument = await loadingTask.promise;

	try {
		const totalPages = pdfDocument.numPages || 1;
		const page = await pdfDocument.getPage(1);
		try {
			const baseViewport = page.getViewport({ scale: 1 });
			const scale = THUMBNAIL_WIDTH / baseViewport.width;
			const viewport = page.getViewport({ scale });

			const canvas = document.createElement('canvas');
			canvas.width = Math.ceil(viewport.width);
			canvas.height = Math.ceil(viewport.height);

			const context = canvas.getContext('2d', { alpha: false });
			if (!context) {
				return { totalPages };
			}

			await page.render({ canvasContext: context, viewport, canvas }).promise;

			return {
				totalPages,
				thumbnailDataUrl: canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY)
			};
		} finally {
			page.cleanup();
		}
	} finally {
		await pdfDocument.destroy();
	}
}

/**
 * Generate only first-page thumbnail.
 */
export async function generateFirstPageThumbnail(file: File): Promise<string | undefined> {
	const metadata = await extractPdfUploadMetadata(file);
	return metadata?.thumbnailDataUrl;
}
