import { error } from '@sveltejs/kit';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';

export async function streamOwnedDocumentFile(
	storageId: string,
	clerkUserId: string | null
): Promise<Response> {
	if (!clerkUserId) {
		error(401, 'Unauthorized');
	}

	const user = await convexClient.query(api.users.getByClerkId, {
		clerkId: clerkUserId
	});
	if (!user) {
		error(404, 'User not found');
	}

	const books = await convexClient.query(api.books.getByStorageId, {
		storageId: storageId as Id<'_storage'>
	});
	if (!books || books.length === 0) {
		error(404, 'File not found');
	}

	const book = books[0];
	if (book.userId !== user._id) {
		error(403, 'Access denied');
	}

	const url = await convexClient.query(api.files.getFileUrl, {
		storageId: storageId as Id<'_storage'>
	});
	if (!url) {
		error(404, 'File not available');
	}

	const response = await fetch(url);
	if (!response.ok) {
		error(502, 'Failed to fetch file from storage');
	}

	const headers = new Headers();
	headers.set('Content-Type', 'application/pdf');
	headers.set('Cache-Control', 'private, max-age=3600');
	headers.set('Content-Disposition', `inline; filename="${book.fileName || 'document.pdf'}"`);

	return new Response(response.body, {
		status: 200,
		headers
	});
}
