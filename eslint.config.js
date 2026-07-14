// Flat config (ESLint 10) — replaces the legacy .eslintrc.cjs (MIN-39).
// We register react-hooks / react-refresh as an explicit `plugins` OBJECT (flat-config
// requirement) and borrow only their rule maps, rather than spreading the plugins'
// shareable configs — some of those (react-hooks 7's 'recommended-latest') still ship
// the legacy `plugins: ["..."]` array form that eslint 10 flat-config rejects.
// react-hooks 7's full recommended set (incl. set-state-in-effect) runs unmodified — the
// effects it flagged were refactored to react.dev's "you might not need an effect" patterns.
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // dist = build output; coverage = vitest's generated lcov report (both are non-source).
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
