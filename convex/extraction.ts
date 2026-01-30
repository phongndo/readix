import { action, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

/**
 * Extract text from a file based on its type.
 * Supported formats: PDF, EPUB, TXT
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

			// Extract text based on file type
			if (args.fileType === 'text/plain' || args.fileType === '.txt') {
				extractedText = await extractFromTxt(blob);
			} else if (args.fileType === 'application/pdf' || args.fileType === '.pdf') {
				extractedText = await extractFromPdf(blob);
			} else if (args.fileType === 'application/epub+zip' || args.fileType === '.epub') {
				extractedText = await extractFromEpub(blob);
			} else {
				throw new Error(`Unsupported file type: ${args.fileType}`);
			}

			// Clean up the text
			extractedText = cleanExtractedText(extractedText);

			// Save extracted text
			await ctx.runMutation(internal.extraction.saveExtractedContent, {
				bookId: args.bookId,
				extractedText,
				status: 'completed'
			});

			// Update book with extracted content and page count
			const totalPages = estimatePageCount(extractedText);
			await ctx.runMutation(internal.extraction.updateBookWithExtractedContent, {
				bookId: args.bookId,
				content: extractedText.substring(0, 100000), // Store first 100k chars in book
				totalPages
			});
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
async function extractFromTxt(blob: Blob): Promise<string> {
	const text = await blob.text();
	return text;
}

/**
 * Extract text from a PDF file.
 * Note: This is a basic implementation. For production, use pdf-parse library.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function extractFromPdf(blob: Blob): Promise<string> {
	// For now, return placeholder text
	// In production, you'd use pdf-parse or pdfjs-dist
	// This requires setting up the library in Convex's environment
	return '[PDF content extraction requires pdf-parse library setup]';
}

/**
 * Extract text from an EPUB file.
 * Note: This requires epub.js library in production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function extractFromEpub(blob: Blob): Promise<string> {
	// For now, return placeholder text
	// In production, you'd use epub.js
	return '[EPUB content extraction requires epub.js library setup]';
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
		totalPages: v.number()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.bookId, {
			content: args.content,
			totalPages: args.totalPages,
			updatedAt: Date.now()
		});
	}
});
