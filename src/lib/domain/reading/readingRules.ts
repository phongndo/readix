import type { ReadingPosition } from '$lib/domain/reading/ReadingPosition';

/**
 * Calculate which page user is on based on scroll position
 * Accounts for variable page heights in PDFs
 */
export function calculateCurrentPage(scrollOffset: number, pageHeights: number[]): number {
	let accumulatedHeight = 0;

	for (let i = 0; i < pageHeights.length; i++) {
		accumulatedHeight += pageHeights[i];
		if (scrollOffset < accumulatedHeight) {
			return i + 1; // Pages are 1-indexed
		}
	}

	return pageHeights.length;
}

/**
 * Calculate scroll offset for a specific page
 */
export function calculateScrollOffsetForPage(targetPage: number, pageHeights: number[]): number {
	let offset = 0;

	for (let i = 0; i < targetPage - 1 && i < pageHeights.length; i++) {
		offset += pageHeights[i];
	}

	return offset;
}

/**
 * Calculate reading progress percentage
 */
export function calculateReadingProgress(currentPage: number, totalPages: number): number {
	if (totalPages === 0) return 0;
	return Math.min(100, Math.round((currentPage / totalPages) * 100));
}

/**
 * Check if position has changed significantly enough to save
 * Prevents excessive database writes
 */
export function shouldSavePosition(
	current: ReadingPosition,
	previous: ReadingPosition | null,
	minPageDiff = 1,
	minOffsetDiff = 100
): boolean {
	if (!previous) return true;

	const pageChanged = Math.abs(current.page - previous.page) >= minPageDiff;
	const offsetChanged = Math.abs(current.scrollOffset - previous.scrollOffset) >= minOffsetDiff;

	return pageChanged || offsetChanged;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
	if (minutes < 1) return '< 1 min';
	if (minutes < 60) return `${Math.round(minutes)} min`;

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = Math.round(minutes % 60);

	if (remainingMinutes === 0) return `${hours} hr`;
	return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Calculate session duration from timestamps
 */
export function calculateSessionDuration(startTime: number, endTime: number): number {
	return Math.round((endTime - startTime) / 1000 / 60); // Minutes
}

/**
 * Generate bookmark title from page content or default
 */
export function generateBookmarkTitle(
	page: number,
	firstLineOfPage?: string,
	maxLength = 30
): string {
	if (!firstLineOfPage || firstLineOfPage.trim().length === 0) {
		return `Page ${page}`;
	}

	const trimmed = firstLineOfPage.trim();
	if (trimmed.length <= maxLength) return trimmed;

	return trimmed.substring(0, maxLength - 3) + '...';
}
