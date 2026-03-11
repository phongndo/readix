import { describe, expect, it } from 'vitest';
import {
	estimateReadingMinutes,
	normalizeAuthor,
	normalizeTitle,
	sanitizeExtractedMetadata
} from './metadataNormalization';

describe('metadataNormalization', () => {
	it('normalizes title and author values', () => {
		expect(normalizeTitle('  A Tour of C++  ')).toBe('a tour of c');
		expect(normalizeAuthor('Bjarne Stroustrup!')).toBe('bjarne stroustrup');
	});

	it('prefers embedded metadata when present', () => {
		const metadata = sanitizeExtractedMetadata({
			fileName: 'tour-of-cpp.pdf',
			embeddedTitle: 'A Tour of C++',
			embeddedAuthor: 'Bjarne Stroustrup',
			totalPages: 320,
			thumbnailDataUrl: 'data:image/jpeg;base64,abc'
		});

		expect(metadata.title).toBe('A Tour of C++');
		expect(metadata.author).toBe('Bjarne Stroustrup');
		expect(metadata.totalPages).toBe(320);
		expect(metadata.titleSource).toBe('embedded');
		expect(metadata.authorSource).toBe('embedded');
		expect(metadata.pageCountSource).toBe('pdf');
		expect(metadata.coverSource).toBe('first-page');
	});

	it('falls back to filename when embedded metadata is missing', () => {
		const metadata = sanitizeExtractedMetadata({
			fileName: 'clean_code_2nd-edition.pdf'
		});

		expect(metadata.title).toBe('clean code 2nd edition');
		expect(metadata.author).toBeUndefined();
		expect(metadata.totalPages).toBe(1);
		expect(metadata.titleSource).toBe('filename');
		expect(metadata.authorSource).toBe('unknown');
		expect(metadata.pageCountSource).toBe('unknown');
		expect(metadata.coverSource).toBe('none');
	});

	it('estimates reading minutes from page count', () => {
		expect(estimateReadingMinutes(1)).toBe(2);
		expect(estimateReadingMinutes(120)).toBe(150);
	});
});
