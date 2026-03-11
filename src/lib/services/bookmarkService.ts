import { Effect, Option } from 'effect';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';
import { DatabaseError } from '$lib/effect/errors';
import type { Bookmark } from '$lib/domain/reading/ReadingPosition';
import { lookupConvexUserByClerkId } from '$lib/services/userService';

export type BookmarkColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

interface BookmarkInput {
	bookId: string;
	userId: string;
	page: number;
	title: string;
	color?: BookmarkColor;
}

/**
 * Fetch all bookmarks for a book
 */
export function fetchBookmarks(
	bookId: string,
	userId: string
): Effect.Effect<Bookmark[], DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.query(api.bookmarks.getBookmarks, {
				bookId: bookId as Id<'books'>,
				userId: userId as Id<'users'>
			}),
		catch: (error) => new DatabaseError('Failed to fetch bookmarks', error)
	}).pipe(
		Effect.map((docs) =>
			docs.map((doc) => ({
				id: doc._id,
				bookId: doc.bookId,
				userId: doc.userId,
				page: doc.page,
				title: doc.title,
				color: doc.color ? Option.some(doc.color) : Option.none(),
				createdAt: new Date(doc.createdAt)
			}))
		)
	);
}

/**
 * Create a new bookmark
 */
export function createBookmark(input: BookmarkInput): Effect.Effect<string, DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.bookmarks.createBookmark, {
				bookId: input.bookId as Id<'books'>,
				userId: input.userId as Id<'users'>,
				page: input.page,
				title: input.title,
				color: input.color,
				createdAt: Date.now()
			}),
		catch: (error) => new DatabaseError('Failed to create bookmark', error)
	});
}

/**
 * Delete a bookmark by ID
 */
export function deleteBookmark(
	bookmarkId: string,
	userId: string
): Effect.Effect<void, DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.bookmarks.deleteBookmark, {
				bookmarkId: bookmarkId as Id<'bookmarks'>,
				userId: userId as Id<'users'>
			}),
		catch: (error) => new DatabaseError('Failed to delete bookmark', error)
	});
}

/**
 * Update bookmark title or color
 */
export function updateBookmark(
	bookmarkId: string,
	userId: string,
	updates: { title?: string; color?: BookmarkColor }
): Effect.Effect<void, DatabaseError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.bookmarks.updateBookmark, {
				bookmarkId: bookmarkId as Id<'bookmarks'>,
				userId: userId as Id<'users'>,
				updates
			}),
		catch: (error) => new DatabaseError('Failed to update bookmark', error)
	});
}

/**
 * Lookup Convex user ID by Clerk ID
 */
export function lookupConvexUserId(
	clerkId: string
): Effect.Effect<{ _id: string } | null, DatabaseError> {
	return lookupConvexUserByClerkId(clerkId);
}
