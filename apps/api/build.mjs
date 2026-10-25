// Bundles the API into one ESM file that plain Node can run (no tsx in production).
// npm packages stay external and come from node_modules; our own TypeScript
// workspace package (@salary/shared) is bundled in, because Node can't run .ts.
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const { dependencies } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const external = Object.keys(dependencies).filter((name) => !name.startsWith('@salary/'));

await build({
  entryPoints: { main: 'src/main.ts', seedReset: 'src/seedReset.ts' },
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  external,
  // tsconfig's experimentalDecorators applies, so TypeORM's decorators compile as before.
  tsconfig: 'tsconfig.json',
  logLevel: 'info',
});
