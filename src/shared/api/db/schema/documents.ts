import { pgTable, uuid, text, timestamp, bigint, integer } from 'drizzle-orm/pg-core';
export const documents = pgTable('documents', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),

	// Metadata
	title: text('title').notNull(),
	author: text('author'),
	description: text('description'),

	// File storage (S3)
	fileKey: text('file_key').notNull(), // S3 object key
	fileName: text('file_name').notNull(), // Original filename
	fileSize: bigint('file_size', { mode: 'number' }),
	mimeType: text('mime_type'),

	// Extracted data (populated later)
	pageCount: integer('page_count'),
	coverKey: text('cover_key'), // S3 key for cover image

	// Timestamps
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
