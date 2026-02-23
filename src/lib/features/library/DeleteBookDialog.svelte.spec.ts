import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DeleteBookDialog from './DeleteBookDialog.svelte';

describe('DeleteBookDialog', () => {
	it('requires exact title match before allowing hard delete', async () => {
		const onConfirm = vi.fn().mockResolvedValue(undefined);

		const { getByText } = render(DeleteBookDialog, {
			props: {
				open: true,
				bookTitle: 'Deep Work',
				preview: {
					bookId: 'book-1',
					title: 'Deep Work',
					fileName: 'deep-work.pdf',
					hasStoredFile: true,
					counts: {
						bookContent: 1,
						documentText: 12,
						readingPositions: 1,
						bookmarks: 3,
						annotations: 4,
						readingSessions: 8,
						fileStorage: 1
					},
					totalRecords: 30
				},
				previewError: null,
				isLoading: false,
				isDeleting: false,
				onCancel: () => {},
				onConfirm
			}
		});

		const deleteButton = getByText('Delete Permanently');
		await expect.element(deleteButton).toBeDisabled();

		const input = document.querySelector('input');
		expect(input).toBeTruthy();
		if (!input) throw new Error('Expected confirmation input');

		input.value = 'Wrong title';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await expect.element(deleteButton).toBeDisabled();

		input.value = 'Deep Work';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await expect.element(deleteButton).toBeEnabled();

		await deleteButton.click();
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
