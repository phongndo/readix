const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_QUALITY = 0.85;

function isPdfFile(file: File): boolean {
	return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Generate a JPEG data URL thumbnail from the first page of a PDF file.
 */
export async function generateFirstPageThumbnail(file: File): Promise<string | undefined> {
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
				return undefined;
			}

			await page.render({ canvasContext: context, viewport, canvas }).promise;

			return canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
		} finally {
			page.cleanup();
		}
	} finally {
		await pdfDocument.destroy();
	}
}
