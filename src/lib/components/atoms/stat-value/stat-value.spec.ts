import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatValue from './stat-value.svelte';
import { BookOpen } from '@lucide/svelte';

describe('StatValue', () => {
	it('renders value and label correctly', async () => {
		const { getByText } = render(StatValue, {
			props: {
				icon: BookOpen,
				value: 42,
				label: 'Books'
			}
		});
		await expect.element(getByText('42')).toBeInTheDocument();
		await expect.element(getByText('Books')).toBeInTheDocument();
	});

	it('renders with suffix', async () => {
		const { getByText } = render(StatValue, {
			props: {
				icon: BookOpen,
				value: 10,
				label: 'Hours',
				suffix: 'h'
			}
		});
		await expect.element(getByText('10h')).toBeInTheDocument();
	});

	it('applies compact variant', async () => {
		const { container } = render(StatValue, {
			props: {
				icon: BookOpen,
				value: 5,
				label: 'Streak',
				variant: 'compact'
			}
		});
		const wrapper = container.querySelector('.flex');
		expect(wrapper).toHaveClass('scale-90');
	});
});
