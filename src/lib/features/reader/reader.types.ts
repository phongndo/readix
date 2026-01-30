import type { Book } from '$lib/domain/book/Book';

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
