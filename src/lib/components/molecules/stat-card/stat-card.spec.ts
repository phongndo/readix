import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatCard from './stat-card.svelte';
import { BookOpen } from '@lucide/svelte';

describe('StatCard', () => {
	it('renders value and label correctly', async () => {
		const { getByText } = render(StatCard, {
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
		const { getByText } = render(StatCard, {
			props: {
				icon: BookOpen,
				value: 10,
				label: 'Hours',
				suffix: 'h'
			}
		});
		await expect.element(getByText('10h')).toBeInTheDocument();
	});

	it('applies interactive variant when onClick provided', async () => {
		const { container } = render(StatCard, {
			props: {
				icon: BookOpen,
				value: 5,
				label: 'Streak',
				onClick: () => {}
			}
		});
		const card = container.querySelector('[class*="cursor-pointer"]');
		expect(card).toBeTruthy();
	});

	it('applies custom color to icon', async () => {
		const { container } = render(StatCard, {
			props: {
				icon: BookOpen,
				value: 100,
				label: 'Pages',
				color: 'text-green-500'
			}
		});
		const icon = container.querySelector('.text-green-500');
		expect(icon).toBeTruthy();
	});
});
