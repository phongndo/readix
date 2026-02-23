const PDF_WORKER_SRC = '/pdf.worker.mjs';

export async function getPdfPageCountFromUrl(url: string): Promise<number | undefined> {
	if (typeof window === 'undefined') {
		return undefined;
	}

	const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
	pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

	const getPageCount = async (source: { url?: string; data?: ArrayBuffer }): Promise<number> => {
		const loadingTask = pdfjs.getDocument({
			...source,
			withCredentials: true
		});
		const pdfDocument = await loadingTask.promise;

		try {
			return Math.max(1, pdfDocument.numPages || 1);
		} finally {
			await pdfDocument.destroy();
		}
	};

	try {
		return await getPageCount({ url });
	} catch {
		const response = await fetch(url, { credentials: 'include' });
		if (!response.ok) {
			return undefined;
		}
		const buffer = await response.arrayBuffer();
		return await getPageCount({ data: buffer });
	}
}
