// ESLint du monorepo (apps/, packages/). landing/ et tools/ ont leurs propres tests.
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default ts.config(
  { ignores: ['**/dist/', '**/build/', '**/.svelte-kit/', '**/node_modules/'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: ts.parser, extraFileExtensions: ['.svelte'] } },
  },
  {
    // Orchestrateur sans modèle : aucun SDK de fournisseur de LLM (contrôle complet en CI avec TH-015).
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['openai', '@anthropic-ai/*', '@google/generative-ai', '@google/genai', '@mistralai/*', 'cohere-ai', 'ollama'],
              message: 'Tokenhood est un orchestrateur sans modèle : aucun appel à un fournisseur de LLM côté serveur.',
            },
          ],
        },
      ],
    },
  },
);
