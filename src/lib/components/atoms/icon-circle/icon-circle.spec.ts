import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import IconCircle from './icon-circle.svelte';
import { BookOpen } from '@lucide/svelte';

describe('IconCircle', () => {
	it('renders with default variant', async () => {
		const { container } = render(IconCircle, {
			props: { icon: BookOpen }
		});
		const circle = container.querySelector('div');
		expect(circle).toHaveClass('bg-neutral-800');
	});

	it('renders with primary variant', async () => {
		const { container } = render(IconCircle, {
			props: { icon: BookOpen, variant: 'primary' }
		});
		const circle = container.querySelector('div');
		expect(circle).toHaveClass('bg-red-500/10');
	});

	it('applies size classes correctly', async () => {
		const { container } = render(IconCircle, {
			props: { icon: BookOpen, size: 'lg' }
		});
		const circle = container.querySelector('div');
		expect(circle).toHaveClass('h-12', 'w-12');
	});
});
