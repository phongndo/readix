import { describe, expect, it } from 'vitest';
import { areFuzzyDuplicateCandidates, getPageTolerance } from './duplicateRules';

describe('duplicateRules', () => {
	it('computes page tolerance with minimum threshold', () => {
		expect(getPageTolerance(20, 40)).toBe(5);
		expect(getPageTolerance(500, 460)).toBe(50);
	});

	it('matches fuzzy duplicates when titles align and pages are close', () => {
		const isDuplicate = areFuzzyDuplicateCandidates({
			titleA: 'A Tour of C++',
			authorA: 'Bjarne Stroustrup',
			totalPagesA: 320,
			titleB: 'A Tour of C++',
			authorB: 'Bjarne Stroustrup',
			totalPagesB: 330
		});

		expect(isDuplicate).toBe(true);
	});

	it('allows fuzzy matching when one author is missing', () => {
		const isDuplicate = areFuzzyDuplicateCandidates({
			titleA: 'Deep Work',
			authorA: '',
			totalPagesA: 280,
			titleB: 'Deep Work',
			authorB: 'Cal Newport',
			totalPagesB: 270
		});

		expect(isDuplicate).toBe(true);
	});

	it('rejects fuzzy duplicates for different normalized titles', () => {
		const isDuplicate = areFuzzyDuplicateCandidates({
			titleA: 'Deep Work',
			authorA: 'Cal Newport',
			totalPagesA: 280,
			titleB: 'Atomic Habits',
			authorB: 'James Clear',
			totalPagesB: 280
		});

		expect(isDuplicate).toBe(false);
	});
});
