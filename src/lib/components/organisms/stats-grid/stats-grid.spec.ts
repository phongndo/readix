import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StatsGrid from './stats-grid.svelte';
import { BookOpen, Flame, Clock } from '@lucide/svelte';

describe('StatsGrid', () => {
	const mockStats = [
		{ icon: BookOpen, value: 10, label: 'Books', color: 'text-primary' },
		{ icon: Flame, value: 5, label: 'Streak', color: 'text-orange-500' },
		{ icon: Clock, value: 20, label: 'Hours', suffix: 'h', color: 'text-blue-500' }
	];

	it('renders all stat cards', async () => {
		const { getByText } = render(StatsGrid, {
			props: { stats: mockStats }
		});
		await expect.element(getByText('Books')).toBeInTheDocument();
		await expect.element(getByText('Streak')).toBeInTheDocument();
		await expect.element(getByText('Hours')).toBeInTheDocument();
	});

	it('applies correct column classes for 5 columns', async () => {
		const { container } = render(StatsGrid, {
			props: { stats: mockStats, columns: 5 }
		});
		const grid = container.querySelector('.grid');
		expect(grid).toHaveClass('lg:grid-cols-5');
	});

	it('applies correct column classes for 3 columns', async () => {
		const { container } = render(StatsGrid, {
			props: { stats: mockStats, columns: 3 }
		});
		const grid = container.querySelector('.grid');
		expect(grid).toHaveClass('sm:grid-cols-3');
	});

	it('renders values with suffixes', async () => {
		const { getByText } = render(StatsGrid, {
			props: { stats: mockStats }
		});
		await expect.element(getByText('20h')).toBeInTheDocument();
	});
});
