import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));
// FSD Layer order (lower index = lower layer)
const FSD_LAYERS = ['$shared', '$entities', '$features', '$widgets'];
export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  // FSD Import Rules
  {
    files: ['src/shared/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['$entities', '$entities/*'], message: 'shared/ cannot import from entities/' },
          { group: ['$features', '$features/*'], message: 'shared/ cannot import from features/' },
          { group: ['$widgets', '$widgets/*'], message: 'shared/ cannot import from widgets/' },
          { group: ['$lib', '$lib/*'], message: 'Use $shared instead of $lib' },
        ]
      }]
    }
  },
  {
    files: ['src/entities/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['$features', '$features/*'], message: 'entities/ cannot import from features/' },
          { group: ['$widgets', '$widgets/*'], message: 'entities/ cannot import from widgets/' },
          { group: ['$lib', '$lib/*'], message: 'Use $shared instead of $lib' },
          // Cross-slice restriction (entities can't import other entity internals)
          { group: ['$entities/*/model/*', '$entities/*/ui/*', '$entities/*/api/*'], 
            message: 'Cross-slice imports forbidden. Use the slice public API.' },
        ]
      }]
    }
  },
  {
    files: ['src/features/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['$widgets', '$widgets/*'], message: 'features/ cannot import from widgets/' },
          { group: ['$lib', '$lib/*'], message: 'Use $shared instead of $lib' },
          // Cross-slice restriction
          { group: ['$features/*/model/*', '$features/*/ui/*', '$features/*/api/*', '$features/*/lib/*'], 
            message: 'Cross-slice imports forbidden. Use the slice public API.' },
        ]
      }]
    }
  },
  {
    files: ['src/widgets/**/*'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['$lib', '$lib/*'], message: 'Use $shared instead of $lib' },
          // Cross-slice restriction
          { group: ['$widgets/*/ui/*'], 
            message: 'Cross-slice imports forbidden. Use the slice public API.' },
        ]
      }]
    }
  }
);
