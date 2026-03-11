import { normalizeAuthor, normalizeTitle } from './metadataNormalization';

export function getPageTolerance(totalPagesA: number, totalPagesB: number): number {
	const maxPages = Math.max(Math.max(1, totalPagesA), Math.max(1, totalPagesB));
	return Math.max(5, Math.round(maxPages * 0.1));
}

export function areFuzzyDuplicateCandidates(input: {
	titleA: string;
	authorA?: string;
	totalPagesA: number;
	titleB: string;
	authorB?: string;
	totalPagesB: number;
}): boolean {
	const normalizedTitleA = normalizeTitle(input.titleA);
	const normalizedTitleB = normalizeTitle(input.titleB);
	if (!normalizedTitleA || normalizedTitleA !== normalizedTitleB) {
		return false;
	}

	const normalizedAuthorA = normalizeAuthor(input.authorA);
	const normalizedAuthorB = normalizeAuthor(input.authorB);
	const authorMatches =
		!normalizedAuthorA || !normalizedAuthorB || normalizedAuthorA === normalizedAuthorB;
	if (!authorMatches) {
		return false;
	}

	const tolerance = getPageTolerance(input.totalPagesA, input.totalPagesB);
	return Math.abs(input.totalPagesA - input.totalPagesB) <= tolerance;
}
