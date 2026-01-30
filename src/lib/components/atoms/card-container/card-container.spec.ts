import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CardContainer from './card-container.svelte';

describe('CardContainer', () => {
	it('renders with default variant', async () => {
		const { container } = render(CardContainer);
		const card = container.querySelector('div');
		expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
	});

	it('renders with interactive variant', async () => {
		const { container } = render(CardContainer, {
			props: {
				variant: 'interactive',
				children: undefined
			}
		});
		const card = container.querySelector('div');
		expect(card).toHaveClass('cursor-pointer', 'hover:bg-accent/50');
	});

	it('applies padding correctly', async () => {
		const { container } = render(CardContainer, {
			props: {
				padding: 'lg',
				children: undefined
			}
		});
		const card = container.querySelector('div');
		expect(card).toHaveClass('p-8');
	});
});
