import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProgressBar from './progress-bar.svelte';

describe('ProgressBar', () => {
	it('renders with correct percentage', async () => {
		const { container } = render(ProgressBar, {
			props: { value: 50, max: 100 }
		});
		const bar = container.querySelector('[style*="width"]');
		expect(bar).toHaveAttribute('style', expect.stringContaining('width: 50%'));
	});

	it('applies size classes correctly', async () => {
		const { container } = render(ProgressBar, {
			props: { value: 50, size: 'lg' }
		});
		const track = container.querySelector('div');
		expect(track).toHaveClass('h-3');
	});

	it('renders default variant with red color', async () => {
		const { container } = render(ProgressBar, {
			props: { value: 50, variant: 'default' }
		});
		const bar = container.querySelector('[style*="width"]');
		expect(bar).toHaveClass('bg-red-500');
	});

	it('clamps percentage to 100', async () => {
		const { container } = render(ProgressBar, {
			props: { value: 150, max: 100 }
		});
		const bar = container.querySelector('[style*="width"]');
		expect(bar).toHaveAttribute('style', expect.stringContaining('width: 100%'));
	});
});
