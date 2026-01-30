import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Button from './button.svelte';

describe('Button', () => {
	it('renders primary variant with red background', async () => {
		const { getByRole } = render(Button, { props: { variant: 'primary' } });
		const button = getByRole('button');
		await expect.element(button).toHaveClass('bg-red-500');
	});

	it('renders secondary variant with dark background', async () => {
		const { getByRole } = render(Button, { props: { variant: 'secondary' } });
		const button = getByRole('button');
		await expect.element(button).toHaveClass('bg-neutral-800');
	});

	it('renders ghost variant with transparent background', async () => {
		const { getByRole } = render(Button, { props: { variant: 'ghost' } });
		const button = getByRole('button');
		await expect.element(button).toHaveClass('bg-transparent');
	});

	it('renders as link when href is provided', async () => {
		const { getByRole } = render(Button, { props: { href: '/test' } });
		const link = getByRole('link');
		await expect.element(link).toHaveAttribute('href', '/test');
	});

	it('applies disabled state correctly', async () => {
		const { getByRole } = render(Button, { props: { disabled: true } });
		const button = getByRole('button');
		await expect.element(button).toBeDisabled();
	});
});
