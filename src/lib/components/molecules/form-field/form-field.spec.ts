import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormField from './form-field.svelte';

describe('FormField', () => {
	it('renders text input by default', async () => {
		const { getByLabelText } = render(FormField, {
			props: {
				label: 'Title',
				name: 'title',
				value: ''
			}
		});
		const input = getByLabelText('Title');
		await expect.element(input).toHaveAttribute('type', 'text');
	});

	it('renders textarea when type is textarea', async () => {
		const { getByLabelText } = render(FormField, {
			props: {
				label: 'Description',
				name: 'description',
				type: 'textarea',
				value: ''
			}
		});
		const textarea = getByLabelText('Description');
		await expect.element(textarea).toHaveAttribute('rows', '3');
	});

	it('shows required indicator', async () => {
		const { getByText } = render(FormField, {
			props: {
				label: 'Title',
				name: 'title',
				value: '',
				required: true
			}
		});
		await expect.element(getByText('*')).toBeInTheDocument();
	});

	it('displays error message', async () => {
		const { getByText } = render(FormField, {
			props: {
				label: 'Title',
				name: 'title',
				value: '',
				error: 'Title is required'
			}
		});
		await expect.element(getByText('Title is required')).toBeInTheDocument();
	});

	it('applies custom rows for textarea', async () => {
		const { getByLabelText } = render(FormField, {
			props: {
				label: 'Content',
				name: 'content',
				type: 'textarea',
				value: '',
				rows: 6
			}
		});
		const textarea = getByLabelText('Content');
		await expect.element(textarea).toHaveAttribute('rows', '6');
	});
});
