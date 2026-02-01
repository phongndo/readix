import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';

/**
 * Serve PDF files from Convex storage with authentication
 * Verifies user owns the book before serving
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const { storageId } = params;

	// Get user from Clerk auth
	const auth = locals.auth();
	const userId = auth.userId;
	if (!userId) {
		error(401, 'Unauthorized');
	}

	try {
		// Lookup Convex user by Clerk ID
		const user = await convexClient.query(api.users.getByClerkId, {
			clerkId: userId
		});

		if (!user) {
			error(404, 'User not found');
		}

		// Find book that owns this file
		const books = await convexClient.query(api.books.getByStorageId, {
			storageId: storageId as Id<'_storage'>
		});

		if (!books || books.length === 0) {
			error(404, 'File not found');
		}

		const book = books[0];

		// Verify user owns this book (both are Convex IDs now)
		if (book.userId !== user._id) {
			error(403, 'Access denied');
		}

		// Get download URL from Convex storage
		const url = await convexClient.query(api.files.getFileUrl, {
			storageId: storageId as Id<'_storage'>
		});

		if (!url) {
			error(404, 'File not available');
		}

		// Fetch the file from Convex
		const response = await fetch(url);

		if (!response.ok) {
			error(502, 'Failed to fetch file from storage');
		}

		// Stream the response with proper headers
		const headers = new Headers();
		headers.set('Content-Type', 'application/pdf');
		headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
		headers.set('Content-Disposition', `inline; filename="${book.fileName || 'document.pdf'}"`);

		return new Response(response.body, {
			status: 200,
			headers
		});
	} catch (err) {
		console.error('Error serving file:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		error(500, 'Internal server error');
	}
};
