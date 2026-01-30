import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContributionCalendar from './contribution-calendar.svelte';

describe('ContributionCalendar', () => {
	const mockActivity = [
		{ date: new Date(), pages: 50 },
		{ date: new Date(Date.now() - 86400000), pages: 25 },
		{ date: new Date(Date.now() - 172800000), pages: 120 }
	];

	it('renders calendar with title', async () => {
		const { getByText } = render(ContributionCalendar, {
			props: { activity: mockActivity }
		});
		await expect.element(getByText('Reading Activity')).toBeInTheDocument();
	});

	it('shows activity legend', async () => {
		const { getByText } = render(ContributionCalendar, {
			props: { activity: mockActivity }
		});
		await expect.element(getByText('Less')).toBeInTheDocument();
		await expect.element(getByText('More')).toBeInTheDocument();
	});

	it('renders month labels', async () => {
		const { getByText } = render(ContributionCalendar, {
			props: { activity: mockActivity }
		});
		await expect.element(getByText('Jan')).toBeInTheDocument();
	});

	it('renders day labels', async () => {
		const { getByText } = render(ContributionCalendar, {
			props: { activity: mockActivity }
		});
		await expect.element(getByText('Mon')).toBeInTheDocument();
		await expect.element(getByText('Wed')).toBeInTheDocument();
		await expect.element(getByText('Fri')).toBeInTheDocument();
	});
});
