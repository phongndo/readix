import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Generate a signed URL for uploading a file to Convex storage.
 * The client uploads directly to this URL, then calls createBookWithFile
 * to associate the file with a book record.
 */
export const generateUploadUrl = mutation({
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	}
});

/**
 * Get the URL for a stored file.
 * Used to serve files back to the client.
 */
export const getFileUrl = query({
	args: { storageId: v.id('_storage') },
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId);
	}
});

/**
 * Delete a file from storage.
 * Called when a book is deleted or file is replaced.
 */
export const deleteFile = mutation({
	args: { storageId: v.id('_storage') },
	handler: async (ctx, args) => {
		await ctx.storage.delete(args.storageId);
	}
});
