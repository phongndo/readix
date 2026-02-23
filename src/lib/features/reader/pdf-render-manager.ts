export interface RenderTextItem {
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
	fontSize: number;
}

interface PageHost {
	wrapper: HTMLDivElement;
	canvasContainer: HTMLDivElement;
	textLayerContainer: HTMLDivElement;
}

interface PdfRenderManagerOptions {
	container: HTMLElement;
	pagesContainer: HTMLElement;
	totalPages: number;
	zoom: number;
	estimatedPageHeight: number;
	overscanPages?: number;
	renderPage: (pageNum: number, container: HTMLElement, zoom: number) => Promise<void>;
	renderTextLayer: (
		pageNum: number,
		container: HTMLElement,
		zoom: number
	) => Promise<RenderTextItem[]>;
	onTextLayerMounted?: (pageNum: number, textLayer: HTMLElement) => void;
	onPageText?: (pageNum: number, textItems: RenderTextItem[]) => void;
}

/**
 * Virtualized PDF rendering manager.
 * Maintains lightweight placeholders for all pages and renders only a nearby window.
 */
export class PdfRenderManager {
	private readonly container: HTMLElement;
	private readonly pagesContainer: HTMLElement;
	private readonly totalPages: number;
	private readonly overscanPages: number;
	private readonly renderPageFn: PdfRenderManagerOptions['renderPage'];
	private readonly renderTextLayerFn: PdfRenderManagerOptions['renderTextLayer'];
	private readonly onTextLayerMounted?: PdfRenderManagerOptions['onTextLayerMounted'];
	private readonly onPageText?: PdfRenderManagerOptions['onPageText'];

	private zoom: number;
	private estimatedPageHeight: number;
	private pageHosts = new Map<number, PageHost>();
	private pageHeights = new Map<number, number>();
	private renderedPages = new Set<number>();
	private pendingRenders = new Set<number>();
	private renderQueue = Promise.resolve();
	private rafId: number | null = null;
	private activeRange: { start: number; end: number } = { start: 1, end: 1 };

	constructor(options: PdfRenderManagerOptions) {
		this.container = options.container;
		this.pagesContainer = options.pagesContainer;
		this.totalPages = options.totalPages;
		this.zoom = options.zoom;
		this.estimatedPageHeight = options.estimatedPageHeight;
		this.overscanPages = options.overscanPages ?? 4;
		this.renderPageFn = options.renderPage;
		this.renderTextLayerFn = options.renderTextLayer;
		this.onTextLayerMounted = options.onTextLayerMounted;
		this.onPageText = options.onPageText;
	}

	initialize() {
		this.pagesContainer.innerHTML = '';
		this.pageHosts.clear();
		this.pageHeights.clear();
		this.renderedPages.clear();
		this.pendingRenders.clear();
		this.activeRange = {
			start: 1,
			end: Math.min(this.totalPages, 1 + this.overscanPages)
		};

		for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
			const wrapper = document.createElement('div');
			wrapper.className = 'pdf-page-wrapper relative flex justify-center py-4';
			wrapper.dataset.page = String(pageNum);
			wrapper.style.minHeight = `${this.estimatedPageHeight}px`;

			const canvasContainer = document.createElement('div');
			canvasContainer.className = 'pdf-page shadow-lg';
			wrapper.appendChild(canvasContainer);

			const textLayerContainer = document.createElement('div');
			textLayerContainer.className = 'text-layer-container absolute inset-0';
			wrapper.appendChild(textLayerContainer);

			this.pagesContainer.appendChild(wrapper);
			this.pageHosts.set(pageNum, { wrapper, canvasContainer, textLayerContainer });
			this.pageHeights.set(pageNum, this.estimatedPageHeight);
		}
	}

	scheduleVisibleUpdate() {
		if (this.rafId !== null) return;
		this.rafId = requestAnimationFrame(() => {
			this.rafId = null;
			this.updateVisibleWindow();
		});
	}

	updateVisibleWindow() {
		const currentPage = this.getCurrentPage();
		const start = Math.max(1, currentPage - this.overscanPages);
		const end = Math.min(this.totalPages, currentPage + this.overscanPages);
		this.activeRange = { start, end };

		for (let pageNum = start; pageNum <= end; pageNum++) {
			this.enqueueRender(pageNum);
		}

		for (const renderedPage of this.renderedPages) {
			if (renderedPage < start || renderedPage > end) {
				this.unrenderPage(renderedPage);
			}
		}
	}

	getCurrentPage(): number {
		const containerRect = this.container.getBoundingClientRect();
		const centerY = containerRect.top + containerRect.height / 2;

		let closestPage = 1;
		let closestDistance = Number.POSITIVE_INFINITY;

		for (const [pageNum, host] of this.pageHosts.entries()) {
			const rect = host.wrapper.getBoundingClientRect();
			const pageCenter = rect.top + rect.height / 2;
			const distance = Math.abs(pageCenter - centerY);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestPage = pageNum;
			}
		}

		return closestPage;
	}

	scrollToPage(pageNum: number, behavior: ScrollBehavior = 'smooth') {
		const clampedPage = Math.max(1, Math.min(pageNum, this.totalPages));
		const host = this.pageHosts.get(clampedPage);
		if (!host) return;

		host.wrapper.scrollIntoView({
			behavior,
			block: 'start'
		});
	}

	setZoom(zoom: number, estimatedPageHeight: number) {
		this.zoom = zoom;
		this.estimatedPageHeight = estimatedPageHeight;

		for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
			const host = this.pageHosts.get(pageNum);
			if (!host) continue;
			host.canvasContainer.innerHTML = '';
			host.textLayerContainer.innerHTML = '';
			host.wrapper.style.minHeight = `${this.estimatedPageHeight}px`;
			this.pageHeights.set(pageNum, this.estimatedPageHeight);
		}

		this.renderedPages.clear();
		this.pendingRenders.clear();
		this.updateVisibleWindow();
	}

	cleanup() {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		this.pageHosts.clear();
		this.pageHeights.clear();
		this.renderedPages.clear();
		this.pendingRenders.clear();
	}

	private enqueueRender(pageNum: number) {
		if (this.renderedPages.has(pageNum) || this.pendingRenders.has(pageNum)) {
			return;
		}

		this.pendingRenders.add(pageNum);
		this.renderQueue = this.renderQueue
			.then(async () => {
				if (pageNum < this.activeRange.start || pageNum > this.activeRange.end) {
					return;
				}
				await this.renderSinglePage(pageNum);
			})
			.catch((error) => {
				console.error(`[PdfRenderManager] Failed to render page ${pageNum}:`, error);
			})
			.finally(() => {
				this.pendingRenders.delete(pageNum);
			});
	}

	private async renderSinglePage(pageNum: number) {
		const host = this.pageHosts.get(pageNum);
		if (!host) return;

		await this.renderPageFn(pageNum, host.canvasContainer, this.zoom);
		const textItems = await this.renderTextLayerFn(pageNum, host.textLayerContainer, this.zoom);

		this.onTextLayerMounted?.(pageNum, host.textLayerContainer);
		this.onPageText?.(pageNum, textItems);
		this.renderedPages.add(pageNum);

		const measuredHeight = host.wrapper.getBoundingClientRect().height;
		const stableHeight = Math.max(measuredHeight, this.estimatedPageHeight);
		this.pageHeights.set(pageNum, stableHeight);
		host.wrapper.style.minHeight = '0px';
	}

	private unrenderPage(pageNum: number) {
		const host = this.pageHosts.get(pageNum);
		if (!host) return;

		host.canvasContainer.innerHTML = '';
		host.textLayerContainer.innerHTML = '';
		const fallbackHeight = this.pageHeights.get(pageNum) ?? this.estimatedPageHeight;
		host.wrapper.style.minHeight = `${fallbackHeight}px`;
		this.renderedPages.delete(pageNum);
	}
}
