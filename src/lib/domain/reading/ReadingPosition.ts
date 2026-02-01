import { Schema } from 'effect';

/**
 * Represents a position within a document
 * Format-agnostic - works with PDF, EPUB, or any format
 */
export const ReadingPositionSchema = Schema.Struct({
	bookId: Schema.String,
	userId: Schema.String,
	format: Schema.Literal('pdf', 'epub', 'text'),
	page: Schema.Number,
	scrollOffset: Schema.Number,
	timestamp: Schema.Number
});

export type ReadingPosition = typeof ReadingPositionSchema.Type;

/**
 * Bookmark for quick navigation
 */
export const BookmarkSchema = Schema.Struct({
	id: Schema.String,
	bookId: Schema.String,
	userId: Schema.String,
	page: Schema.Number,
	title: Schema.String,
	color: Schema.optionalWith(Schema.Literal('yellow', 'green', 'blue', 'pink', 'purple'), {
		as: 'Option'
	}),
	createdAt: Schema.DateFromNumber
});

export type Bookmark = typeof BookmarkSchema.Type;

/**
 * Text selection position within a page
 */
export const TextPositionSchema = Schema.Struct({
	startOffset: Schema.Number,
	endOffset: Schema.Number,
	boundingBoxes: Schema.Array(
		Schema.Struct({
			x: Schema.Number,
			y: Schema.Number,
			width: Schema.Number,
			height: Schema.Number
		})
	)
});

export type TextPosition = typeof TextPositionSchema.Type;

/**
 * Annotation (highlight or note)
 */
export const AnnotationSchema = Schema.Struct({
	id: Schema.String,
	bookId: Schema.String,
	userId: Schema.String,
	type: Schema.Literal('highlight', 'note'),
	page: Schema.Number,
	position: TextPositionSchema,
	highlightedText: Schema.String,
	note: Schema.optionalWith(Schema.String, { as: 'Option' }),
	color: Schema.String,
	createdAt: Schema.DateFromNumber,
	updatedAt: Schema.DateFromNumber
});

export type Annotation = typeof AnnotationSchema.Type;

/**
 * Reading session analytics
 */
export const ReadingSessionSchema = Schema.Struct({
	id: Schema.String,
	bookId: Schema.String,
	userId: Schema.String,
	startPage: Schema.Number,
	endPage: Schema.Number,
	durationMinutes: Schema.Number,
	startTime: Schema.DateFromNumber,
	endTime: Schema.DateFromNumber
});

export type ReadingSession = typeof ReadingSessionSchema.Type;

/**
 * Extracted text for search
 */
export const DocumentTextSchema = Schema.Struct({
	id: Schema.String,
	bookId: Schema.String,
	page: Schema.Number,
	text: Schema.String,
	wordCount: Schema.Number,
	createdAt: Schema.DateFromNumber
});

export type DocumentText = typeof DocumentTextSchema.Type;
