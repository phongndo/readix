import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { streamOwnedDocumentFile } from '$lib/services/document/file-access.server';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		return await streamOwnedDocumentFile(params.storageId, locals.auth().userId);
	} catch (err) {
		console.error('Error serving file:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		error(500, 'Internal server error');
	}
};
