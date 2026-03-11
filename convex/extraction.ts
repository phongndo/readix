import { action, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { v } from 'convex/values';

type ExtractedPageText = {
	page: number;
	text: string;
};

type ExtractedFileContent = {
	extractedText: string;
	totalPages?: number;
	pages: ExtractedPageText[];
};

/**
 * Extract text from a file based on its type.
 * Supported formats: PDF and TXT
 */
export const extractTextFromFile = action({
	args: {
		bookId: v.id('books'),
		storageId: v.id('_storage'),
		fileType: v.string()
	},
	handler: async (ctx, args) => {
		try {
			// Mark as processing
			await ctx.runMutation(internal.extraction.updateExtractionStatus, {
				bookId: args.bookId,
				status: 'processing'
			});

			// Get the file from storage
			const fileUrl = await ctx.storage.getUrl(args.storageId);
			if (!fileUrl) {
				throw new Error('File not found in storage');
			}

			// Download the file
			const response = await fetch(fileUrl);
			if (!response.ok) {
				throw new Error(`Failed to download file: ${response.status}`);
			}

			const blob = await response.blob();
			let extractedText = '';
			let totalPages: number | undefined;
			let pages: ExtractedPageText[] = [];

			// Extract text based on file type
			if (args.fileType === 'text/plain' || args.fileType === '.txt') {
				const extractedContent = await extractFromTxt(blob);
				extractedText = extractedContent.extractedText;
				totalPages = extractedContent.totalPages;
				pages = extractedContent.pages;
			} else if (args.fileType === 'application/pdf' || args.fileType === '.pdf') {
				const extractedContent = await extractFromPdf(blob);
				extractedText = extractedContent.extractedText;
				totalPages = extractedContent.totalPages;
				pages = extractedContent.pages;
			} else {
				throw new Error(`Unsupported file type: ${args.fileType}`);
			}

			// Clean up the text
			extractedText = cleanExtractedText(extractedText);
			pages = pages
				.map((page) => ({
					page: page.page,
					text: cleanExtractedText(page.text)
				}))
				.filter((page) => page.text.length > 0);

			// Save extracted text
			await ctx.runMutation(internal.extraction.saveExtractedContent, {
				bookId: args.bookId,
				extractedText,
				status: 'completed'
			});

			await ctx.runMutation(api.documentText.deleteDocumentText, {
				bookId: args.bookId
			});

			for (const page of pages) {
				await ctx.runMutation(api.documentText.savePageText, {
					bookId: args.bookId,
					page: page.page,
					text: page.text,
					wordCount: countWords(page.text),
					createdAt: Date.now()
				});
			}

			// Update book with extracted content.
			// For PDFs, totalPages is set during upload from the actual document metadata.
			const bookPatch: {
				bookId: typeof args.bookId;
				content: string;
				totalPages?: number;
			} = {
				bookId: args.bookId,
				content: extractedText.substring(0, 100000) // Store first 100k chars in book
			};
			if (typeof totalPages === 'number') {
				bookPatch.totalPages = totalPages;
			}
			await ctx.runMutation(internal.extraction.updateBookWithExtractedContent, bookPatch);
		} catch (error) {
			console.error('Text extraction failed:', error);

			// Mark as failed
			await ctx.runMutation(internal.extraction.updateExtractionStatus, {
				bookId: args.bookId,
				status: 'failed',
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
});

/**
 * Extract text from a plain text file.
 */
async function extractFromTxt(blob: Blob): Promise<ExtractedFileContent> {
	const text = await blob.text();
	return {
		extractedText: text,
		totalPages: estimatePageCount(text),
		pages: paginatePlainText(text)
	};
}

/**
 * Extract text from a PDF file.
 */
async function extractFromPdf(blob: Blob): Promise<ExtractedFileContent> {
	const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
	const fileBuffer = await blob.arrayBuffer();
	const loadingTask = pdfjs.getDocument({ data: fileBuffer });
	const pdfDocument = await loadingTask.promise;

	try {
		const pages: ExtractedPageText[] = [];

		for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
			const page = await pdfDocument.getPage(pageNumber);
			try {
				const textContent = await page.getTextContent();
				const text = textContent.items
					.map((item) => ('str' in item ? item.str : ''))
					.join(' ')
					.replace(/\s+/g, ' ')
					.trim();

				pages.push({
					page: pageNumber,
					text
				});
			} finally {
				page.cleanup();
			}
		}

		return {
			extractedText: pages
				.map((page) => page.text)
				.filter(Boolean)
				.join('\n\n'),
			totalPages: pdfDocument.numPages,
			pages
		};
	} finally {
		await pdfDocument.destroy();
	}
}

/**
 * Clean up extracted text.
 */
function cleanExtractedText(text: string): string {
	return text
		.replace(/\r\n/g, '\n') // Normalize line endings
		.replace(/\r/g, '\n')
		.replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
		.trim();
}

/**
 * Estimate page count based on text length.
 * Assumes ~3000 characters per page (rough estimate).
 */
function estimatePageCount(text: string): number {
	const charsPerPage = 3000;
	return Math.max(1, Math.ceil(text.length / charsPerPage));
}

function paginatePlainText(text: string): ExtractedPageText[] {
	const normalized = cleanExtractedText(text);
	if (!normalized) {
		return [];
	}

	const chunkSize = 3000;
	const pages: ExtractedPageText[] = [];
	let start = 0;
	let page = 1;

	while (start < normalized.length) {
		let end = Math.min(normalized.length, start + chunkSize);
		if (end < normalized.length) {
			const splitIndex = normalized.lastIndexOf(' ', end);
			if (splitIndex > start + chunkSize / 2) {
				end = splitIndex;
			}
		}

		pages.push({
			page,
			text: normalized.slice(start, end).trim()
		});

		start = end;
		page += 1;
	}

	return pages.filter((entry) => entry.text.length > 0);
}

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Update the extraction status for a book.
 */
export const updateExtractionStatus = internalMutation({
	args: {
		bookId: v.id('books'),
		status: v.union(
			v.literal('pending'),
			v.literal('processing'),
			v.literal('completed'),
			v.literal('failed')
		),
		error: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('bookContent')
			.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				extractionStatus: args.status,
				extractionError: args.error,
				extractedAt: Date.now()
			});
		} else {
			await ctx.db.insert('bookContent', {
				bookId: args.bookId,
				extractedText: '',
				extractionStatus: args.status,
				extractionError: args.error,
				extractedAt: Date.now()
			});
		}
	}
});

/**
 * Save the extracted content.
 */
export const saveExtractedContent = internalMutation({
	args: {
		bookId: v.id('books'),
		extractedText: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('processing'),
			v.literal('completed'),
			v.literal('failed')
		)
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('bookContent')
			.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				extractedText: args.extractedText,
				extractionStatus: args.status,
				extractedAt: Date.now()
			});
		} else {
			await ctx.db.insert('bookContent', {
				bookId: args.bookId,
				extractedText: args.extractedText,
				extractionStatus: args.status,
				extractedAt: Date.now()
			});
		}
	}
});

/**
 * Update the book record with extracted content.
 */
export const updateBookWithExtractedContent = internalMutation({
	args: {
		bookId: v.id('books'),
		content: v.string(),
		totalPages: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const patch: {
			content: string;
			updatedAt: number;
			totalPages?: number;
		} = {
			content: args.content,
			updatedAt: Date.now()
		};
		if (typeof args.totalPages === 'number') {
			patch.totalPages = Math.max(1, args.totalPages);
		}
		await ctx.db.patch(args.bookId, patch);
	}
});
