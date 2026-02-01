import type { Book } from '$lib/domain/book/Book';
import type { Annotation, Bookmark } from '$lib/domain/reading/ReadingPosition';

// Existing text-based reader types
export type ReaderViewProps = {
	book: Book;
};

export type ProgressBarProps = {
	currentPage: number;
	totalPages: number;
	percentage: number;
};

export type ReaderControlsProps = {
	canGoPrevious: boolean;
	canGoNext: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onJumpToPage: (page: number) => void;
};

// PDF/Document engine types
export interface DocumentEngine {
	readonly format: 'pdf' | 'epub' | 'text';
	load(source: string | ArrayBuffer): Promise<DocumentHandle>;
	renderPage(pageNum: number, container: HTMLElement, scale?: number): Promise<void>;
	getTextContent(pageNum: number): Promise<string>;
	getTotalPages(): number;
	getPageDimensions(pageNum: number): Promise<PageDimensions>;
	convertPointToPage(x: number, y: number, pageNum: number): Promise<Point | null>;
	cleanup(): void;
}

export interface DocumentHandle {
	engine: DocumentEngine;
	totalPages: number;
	metadata: DocumentMetadata;
}

export interface DocumentMetadata {
	title?: string;
	author?: string;
	creationDate?: Date;
}

export interface PageDimensions {
	width: number;
	height: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface TextSelectionEvent {
	page: number;
	text: string;
	position: TextPosition;
}

export interface TextPosition {
	startOffset: number;
	endOffset: number;
	boundingBoxes: BoundingBox[];
}

export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface SearchResult {
	page: number;
	text: string;
	highlightedText: string;
	score: number;
}

// Component props
export interface PdfViewerProps {
	bookId: string;
	userId: string;
	title: string;
	author: string;
	fileUrl: string;
	totalPages: number;
}

export interface ReaderToolbarProps {
	title: string;
	author: string;
	currentPage: number;
	totalPages: number;
	progress: number;
	isVisible: boolean;
	onBack: () => void;
	onToggleSidebar: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
}

export interface PageNavigationProps {
	currentPage: number;
	totalPages: number;
	onPrevious: () => void;
	onNext: () => void;
	onJump: (page: number) => void;
}

export interface BookmarkItemProps {
	bookmark: Bookmark;
	isActive: boolean;
	onClick: () => void;
	onDelete: () => void;
}

export interface HighlightLayerProps {
	page: number;
	annotations: Annotation[];
	scale: number;
	onAnnotationClick: (annotation: Annotation) => void;
}

// PDF Viewer component props
export interface PdfViewerProps {
	bookId: string;
	userId: string;
	title: string;
	author: string;
	fileUrl: string;
	totalPages: number;
}
