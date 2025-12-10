import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			// FSD Layer aliases
			$shared: 'src/shared',
			'$shared/*': 'src/shared/*',
			$entities: 'src/entities',
			'$entities/*': 'src/entities/*',
			$features: 'src/features',
			'$features/*': 'src/features/*',
			$widgets: 'src/widgets',
			'$widgets/*': 'src/widgets/*'
		}
	}
};
export default config;
