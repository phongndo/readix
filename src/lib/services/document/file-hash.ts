function toHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

export async function computeFileSha256(file: File): Promise<string | undefined> {
	if (typeof window === 'undefined' || !window.crypto?.subtle) {
		return undefined;
	}

	const buffer = await file.arrayBuffer();
	const digest = await window.crypto.subtle.digest('SHA-256', buffer);
	return toHex(new Uint8Array(digest));
}
