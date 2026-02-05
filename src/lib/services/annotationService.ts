import { Effect, Option } from 'effect';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';
import { DatabaseError } from '$lib/effect/errors';
import type { Annotation } from '$lib/domain/reading/ReadingPosition';
import type { TextPosition } from '$lib/features/reader/reader.types';

export type AnnotationType = 'highlight' | 'note';

interface AnnotationInput {
	bookId: string;
	userId: string;
	type: AnnotationType;
	page: number;
	position: TextPosition;
	highlightedText: string;
	note?: string;
	color: string;
}

/**
 * Fetch all annotations for a book
 */
export function fetchAnnotations(
	bookId: string,
	userId: string
): Effect.Effect<Annotation[], DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.query(api.annotations.getAnnotations, {
				bookId: bookId as Id<'books'>,
				userId: userId as Id<'users'>
			}),
		catch: (error) => new DatabaseError('Failed to fetch annotations', error)
	}).pipe(
		Effect.map((docs) =>
			docs.map((doc) => ({
				id: doc._id,
				bookId: doc.bookId,
				userId: doc.userId,
				type: doc.type,
				page: doc.page,
				position: doc.position,
				highlightedText: doc.highlightedText,
				note: doc.note ? Option.some(doc.note) : Option.none(),
				color: doc.color,
				createdAt: new Date(doc.createdAt),
				updatedAt: new Date(doc.updatedAt)
			}))
		)
	);
}

/**
 * Create a new annotation
 */
export function createAnnotation(input: AnnotationInput): Effect.Effect<string, DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.annotations.createAnnotation, {
				bookId: input.bookId as Id<'books'>,
				userId: input.userId as Id<'users'>,
				type: input.type,
				page: input.page,
				position: input.position,
				highlightedText: input.highlightedText,
				note: input.note,
				color: input.color,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}),
		catch: (error) => new DatabaseError('Failed to create annotation', error)
	});
}

/**
 * Delete an annotation by ID
 */
export function deleteAnnotation(annotationId: string): Effect.Effect<void, DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.annotations.deleteAnnotation, {
				annotationId: annotationId as Id<'annotations'>
			}),
		catch: (error) => new DatabaseError('Failed to delete annotation', error)
	});
}

/**
 * Update annotation note or color
 */
export function updateAnnotation(
	annotationId: string,
	updates: { note?: string; color?: string }
): Effect.Effect<void, DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.annotations.updateAnnotation, {
				annotationId: annotationId as Id<'annotations'>,
				updates
			}),
		catch: (error) => new DatabaseError('Failed to update annotation', error)
	});
}
