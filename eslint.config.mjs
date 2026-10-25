import tseslint from 'typescript-eslint';

const dbPackages = ['typeorm', 'typeorm/*', 'better-sqlite3', 'pg'];
const adapterPaths = ['**/adapters/**'];

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  ...tseslint.configs.recommended,
  {
    // domain/ and seed/ are pure: they import nothing from the app or from infrastructure.
    files: ['apps/api/src/domain/**/*.ts', 'apps/api/src/seed/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...dbPackages, ...adapterPaths, '**/logic/**', '**/transport/**'] }],
    },
  },
  {
    // logic/ and transport/ never see the database: they depend on ports only (D-012).
    files: ['apps/api/src/logic/**/*.ts', 'apps/api/src/transport/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...dbPackages, ...adapterPaths] }],
    },
  },
);
