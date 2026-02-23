import { describe, expect, it, vi } from 'vitest';
import { createAnnotation } from '../../../convex/annotations';
import { createBookmark, deleteBookmark } from '../../../convex/bookmarks';
import { savePosition } from '../../../convex/readingPositions';

const createBookmarkHandler =
	/** @type {{ _handler: (ctx: unknown, args: unknown) => Promise<unknown> }} */ (
		/** @type {unknown} */ (createBookmark)
	)._handler;
const deleteBookmarkHandler =
	/** @type {{ _handler: (ctx: unknown, args: unknown) => Promise<unknown> }} */ (
		/** @type {unknown} */ (deleteBookmark)
	)._handler;
const createAnnotationHandler =
	/** @type {{ _handler: (ctx: unknown, args: unknown) => Promise<unknown> }} */ (
		/** @type {unknown} */ (createAnnotation)
	)._handler;
const savePositionHandler =
	/** @type {{ _handler: (ctx: unknown, args: unknown) => Promise<unknown> }} */ (
		/** @type {unknown} */ (savePosition)
	)._handler;

describe('Reader Convex security guards', () => {
	it('rejects bookmark creation when user does not own the book', async () => {
		const ownerId = 'user-owner';
		const attackerId = 'user-attacker';
		const ownedBookId = 'book-1';
		const insert = vi.fn();

		const ctx = {
			db: {
				get: vi.fn(async () => ({ _id: ownedBookId, userId: ownerId })),
				insert
			}
		};

		const args = {
			bookId: ownedBookId,
			userId: attackerId,
			page: 3,
			title: 'Page 3',
			color: 'blue',
			createdAt: Date.now()
		};

		await expect(createBookmarkHandler(ctx, args)).rejects.toThrow('Unauthorized');
		expect(insert).not.toHaveBeenCalled();
	});

	it('rejects bookmark deletion when requester is not the bookmark owner', async () => {
		const ownerId = 'user-owner';
		const attackerId = 'user-attacker';
		const ownedBookId = 'book-1';
		const ownedBookmarkId = 'bookmark-1';
		const remove = vi.fn();

		const ctx = {
			db: {
				get: vi.fn(async (id) => {
					if (id === ownedBookmarkId) {
						return {
							_id: ownedBookmarkId,
							bookId: ownedBookId,
							userId: ownerId
						};
					}
					return {
						_id: ownedBookId,
						userId: ownerId
					};
				}),
				delete: remove
			}
		};

		const args = {
			bookmarkId: ownedBookmarkId,
			userId: attackerId
		};

		await expect(deleteBookmarkHandler(ctx, args)).rejects.toThrow('Unauthorized');
		expect(remove).not.toHaveBeenCalled();
	});

	it('rejects annotation creation when user does not own the book', async () => {
		const ownerId = 'user-owner';
		const attackerId = 'user-attacker';
		const ownedBookId = 'book-1';
		const insert = vi.fn();

		const ctx = {
			db: {
				get: vi.fn(async () => ({ _id: ownedBookId, userId: ownerId })),
				insert
			}
		};

		const args = {
			bookId: ownedBookId,
			userId: attackerId,
			type: 'highlight',
			page: 2,
			position: {
				startOffset: 0,
				endOffset: 5,
				boundingBoxes: [{ x: 1, y: 2, width: 20, height: 10 }]
			},
			highlightedText: 'hello',
			color: 'yellow',
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		await expect(createAnnotationHandler(ctx, args)).rejects.toThrow('Unauthorized');
		expect(insert).not.toHaveBeenCalled();
	});

	it('rejects position save when user does not own the book', async () => {
		const ownerId = 'user-owner';
		const attackerId = 'user-attacker';
		const ownedBookId = 'book-1';
		const query = vi.fn();
		const insert = vi.fn();

		const ctx = {
			db: {
				get: vi.fn(async () => ({ _id: ownedBookId, userId: ownerId })),
				query,
				insert
			}
		};

		const args = {
			position: {
				bookId: ownedBookId,
				userId: attackerId,
				format: 'pdf',
				page: 1,
				scrollOffset: 120,
				timestamp: Date.now()
			}
		};

		await expect(savePositionHandler(ctx, args)).rejects.toThrow('Unauthorized');
		expect(query).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
	});
});
