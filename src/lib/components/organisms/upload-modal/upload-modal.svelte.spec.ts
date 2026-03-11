import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Effect } from 'effect';
import { render } from 'vitest-browser-svelte';
import UploadModal from './upload-modal.svelte';

const checkDuplicateCandidatesMock = vi.fn();
const extractPdfUploadMetadataMock = vi.fn();
const computeFileSha256Mock = vi.fn();

vi.mock('$lib/services/bookService', () => ({
	checkDuplicateCandidates: (...args: unknown[]) => checkDuplicateCandidatesMock(...args)
}));

vi.mock('$lib/services/document/pdf-thumbnail', () => ({
	extractPdfUploadMetadata: (...args: unknown[]) => extractPdfUploadMetadataMock(...args)
}));

vi.mock('$lib/services/document/file-hash', () => ({
	computeFileSha256: (...args: unknown[]) => computeFileSha256Mock(...args)
}));

async function flush(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 0));
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function selectFile(file: File): Promise<void> {
	const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
	if (!input) {
		throw new Error('Expected file input');
	}

	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(file);
	Object.defineProperty(input, 'files', {
		value: dataTransfer.files,
		configurable: true
	});
	input.dispatchEvent(new Event('change', { bubbles: true }));
	await flush();
}

describe('UploadModal', () => {
	beforeEach(() => {
		checkDuplicateCandidatesMock.mockReset();
		extractPdfUploadMetadataMock.mockReset();
		computeFileSha256Mock.mockReset();

		checkDuplicateCandidatesMock.mockImplementation(() =>
			Effect.succeed({
				exactDuplicates: [],
				fuzzyDuplicates: []
			})
		);
		extractPdfUploadMetadataMock.mockResolvedValue({
			embeddedTitle: 'Embedded Metadata Title',
			embeddedAuthor: 'Embedded Author',
			totalPages: 220,
			thumbnailDataUrl: 'data:image/jpeg;base64,test'
		});
		computeFileSha256Mock.mockResolvedValue('abc123');
	});

	it('auto-fills title and author from extracted metadata', async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		render(UploadModal, {
			props: {
				open: true,
				userId: 'user-1',
				onSubmit
			}
		});

		const file = new File(['%PDF test'], 'my_upload.pdf', { type: 'application/pdf' });
		await selectFile(file);

		const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
		const authorInput = document.querySelector('input[name="author"]') as HTMLInputElement | null;

		expect(titleInput?.value).toBe('Embedded Metadata Title');
		expect(authorInput?.value).toBe('Embedded Author');
	});

	it('blocks submit on exact duplicate until user confirms', async () => {
		checkDuplicateCandidatesMock.mockImplementation(() =>
			Effect.succeed({
				exactDuplicates: [
					{
						bookId: 'book-1',
						title: 'Existing Book',
						author: 'Author',
						totalPages: 100,
						createdAt: Date.now(),
						updatedAt: Date.now()
					}
				],
				fuzzyDuplicates: []
			})
		);

		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const { getByText } = render(UploadModal, {
			props: {
				open: true,
				userId: 'user-1',
				onSubmit
			}
		});

		const file = new File(['%PDF duplicate'], 'duplicate.pdf', { type: 'application/pdf' });
		await selectFile(file);

		(document.querySelector('button[type="submit"]') as HTMLButtonElement).click();
		await flush();

		expect(onSubmit).not.toHaveBeenCalled();
		await expect.element(getByText('Duplicate Upload Confirmation')).toBeInTheDocument();

		const continueButton = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Continue Anyway'
		) as HTMLButtonElement | undefined;
		if (!continueButton) {
			throw new Error('Continue Anyway button not found');
		}
		continueButton.click();
		await flush();

		expect(onSubmit).toHaveBeenCalledTimes(1);
		expect(onSubmit.mock.calls[0]?.[0]?.allowDuplicate).toBe(true);
	});
});
