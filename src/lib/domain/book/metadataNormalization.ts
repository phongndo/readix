export type TitleSource = 'embedded' | 'filename' | 'manual' | 'unknown';
export type AuthorSource = 'embedded' | 'manual' | 'unknown';
export type PageCountSource = 'pdf' | 'estimated' | 'manual' | 'unknown';
export type CoverSource = 'first-page' | 'manual' | 'none';

export interface SanitizedExtractedMetadataInput {
	fileName: string;
	embeddedTitle?: string;
	embeddedAuthor?: string;
	totalPages?: number;
	thumbnailDataUrl?: string;
}

export interface SanitizedExtractedMetadata {
	title: string;
	author?: string;
	totalPages: number;
	thumbnailDataUrl?: string;
	titleSource: TitleSource;
	authorSource: AuthorSource;
	pageCountSource: PageCountSource;
	coverSource: CoverSource;
}

export function normalizeTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function normalizeAuthor(author: string | undefined): string {
	return (author ?? '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function fileNameToTitle(fileName: string): string {
	return fileName
		.replace(/\.[^/.]+$/, '')
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function estimateReadingMinutes(totalPages: number): number {
	const normalizedPages = Math.max(1, Math.floor(totalPages || 1));
	return Math.max(1, Math.ceil(normalizedPages * 1.25));
}

export function sanitizeExtractedMetadata(
	input: SanitizedExtractedMetadataInput
): SanitizedExtractedMetadata {
	const embeddedTitle = input.embeddedTitle?.trim();
	const embeddedAuthor = input.embeddedAuthor?.trim();
	const fallbackTitle = fileNameToTitle(input.fileName);

	const title = embeddedTitle || fallbackTitle || 'Untitled';
	const author = embeddedAuthor || undefined;
	const totalPages = Math.max(1, Math.floor(input.totalPages ?? 1));
	const thumbnailDataUrl = input.thumbnailDataUrl;

	return {
		title,
		author,
		totalPages,
		thumbnailDataUrl,
		titleSource: embeddedTitle ? 'embedded' : fallbackTitle ? 'filename' : 'unknown',
		authorSource: embeddedAuthor ? 'embedded' : 'unknown',
		pageCountSource: typeof input.totalPages === 'number' ? 'pdf' : 'unknown',
		coverSource: thumbnailDataUrl ? 'first-page' : 'none'
	};
}
