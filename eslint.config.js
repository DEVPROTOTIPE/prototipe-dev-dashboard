import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'functions']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ── REGLA CRÍTICA — único error que rompe la app en runtime ─────
      // Atrapa hooks después de returns condicionales (bug CORE-096)
      'react-hooks/rules-of-hooks': 'error',

      // ── CALIDAD — warnings (no bloquean build) ───────────────────────
      'react-hooks/exhaustive-deps': 'warn',

      // React Compiler aún no está habilitado en este proyecto. Conservamos
      // sus diagnósticos visibles como deuda, sin confundirlos con errores de
      // ejecución del React actual.
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',

      // ── SILENCIADOS ───────────────────────────────────────────────────
      // React 19 no requiere import React — eliminar false-positive masivo
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^React$',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      // Los sandboxes de la biblioteca exportan constantes + componentes
      // juntos por diseño — react-refresh no aplica en ese contexto
      'react-refresh/only-export-components': 'off',
      // Assignments de variables que se usan condicionalmente
      'no-useless-assignment': 'warn',
    },
  },
])
