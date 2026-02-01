/**
 * Scroll position preservation utilities
 * Framework-agnostic functions for maintaining scroll position during content changes
 */

/**
 * Calculate scroll progress as a percentage (0.0 to 1.0)
 * Useful for preserving relative position when content dimensions change
 */
export function calculateScrollProgress(scrollTop: number, scrollHeight: number): number {
	if (scrollHeight <= 0) return 0;
	return Math.min(1, Math.max(0, scrollTop / scrollHeight));
}

/**
 * Restore scroll position based on progress percentage
 * Call this after content dimensions have changed (e.g., after zoom)
 */
export function restoreScrollPosition(container: HTMLElement, progress: number): void {
	const targetScrollTop = progress * container.scrollHeight;
	container.scrollTop = targetScrollTop;
}

/**
 * Calculate target scroll position for proportional restoration
 * Returns the pixel value to set for scrollTop
 */
export function calculateRestoredScrollTop(scrollHeight: number, progress: number): number {
	return progress * scrollHeight;
}
