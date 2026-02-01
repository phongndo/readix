import { Option } from 'effect';
import type { Book } from './Book';
import type { Id } from '$lib/convex/api';

/**
 * Raw Convex book document type
 */
export interface ConvexBook {
	_id: Id<'books'>;
	_creationTime: number;
	userId: Id<'users'>;
	title: string;
	author?: string;
	description?: string;
	coverUrl?: string;
	totalPages: number;
	currentPage: number;
	content?: string;
	fileStorageId?: Id<'_storage'>;
	fileName?: string;
	fileType?: string;
	fileSize?: number;
	documentType?: 'book' | 'research_paper' | 'article' | 'notes' | 'other';
	isCompleted: boolean;
	createdAt: number;
	updatedAt: number;
}

/**
 * Convert Convex book document to Book domain type
 *
 * This adapter ensures type compatibility between Convex database format
 * and the Book domain model. It maps Convex's _id field to the Book's id field
 * and handles all necessary type conversions.
 *
 * @param convexBook - Raw book document from Convex
 * @returns Book - Domain model book with proper types
 */
export function convertConvexBookToBook(convexBook: ConvexBook): Book {
	return {
		id: convexBook._id as unknown as Book['id'],
		userId: convexBook.userId as unknown as Book['userId'],
		title: convexBook.title,
		author: convexBook.author || 'Unknown Author',
		description: convexBook.description || '',
		coverUrl: convexBook.coverUrl || '',
		totalPages: convexBook.totalPages,
		currentPage: convexBook.currentPage,
		content: convexBook.content || '',
		fileStorageId: convexBook.fileStorageId
			? Option.some(String(convexBook.fileStorageId))
			: Option.none(),
		fileName: convexBook.fileName ? Option.some(convexBook.fileName) : Option.none(),
		fileType: convexBook.fileType ? Option.some(convexBook.fileType) : Option.none(),
		fileSize: convexBook.fileSize ? Option.some(convexBook.fileSize) : Option.none(),
		documentType: convexBook.documentType || 'book',
		isCompleted: convexBook.isCompleted,
		createdAt: new Date(convexBook.createdAt),
		updatedAt: new Date(convexBook.updatedAt)
	} as unknown as Book;
}

/**
 * Convert array of Convex books to Book domain types
 */
export function convertConvexBooksToBooks(convexBooks: ConvexBook[]): Book[] {
	return convexBooks.map(convertConvexBookToBook);
}
