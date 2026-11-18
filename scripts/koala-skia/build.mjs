/**
 * Builds the moving koala on Koala's page from the app's own Skia code, so the blog's koala
 * is the app's koala. Needs the koala repo next to this one, with its packages installed.
 *
 *   node scripts/koala-skia/build.mjs
 *
 * Writes public/apps/koala/skia/: main.js loads CanvasKit (Skia for the web), then koala.js
 * draws the koala over the icon, which stays as the picture until then.
 */
import * as esbuild from 'esbuild';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const here = path.dirname(new URL(import.meta.url).pathname);
const K = path.resolve(here, '../../../koala');
const require = createRequire(K + '/package.json');
const babel = require('@babel/core');
const out = path.resolve(here, '../../public/apps/koala/skia');

const babelPlugin = {
  name: 'babel-worklets',
  setup(build) {
    build.onLoad({ filter: /\.(tsx?|jsx?)$/ }, async (args) => {
      if (!(args.path.startsWith(K + '/src') || args.path.startsWith(here + '/src'))) return;
      const code = fs.readFileSync(args.path, 'utf8');
      const res = await babel.transformAsync(code, {
        filename: args.path, babelrc: false, configFile: false,
        presets: [[require.resolve('babel-preset-expo'), { disableImportExportTransform: true }]],
        caller: { name: 'metro', platform: 'web', bundler: 'metro', isServer: false, supportsStaticESM: true },
        cwd: K,
      });
      return { contents: res.code, loader: 'js', resolveDir: path.dirname(args.path) };
    });
  },
};
const aliases = {
  name: 'aliases',
  setup(build) {
    build.onResolve({ filter: /^@\/hooks\/use-theme$/ }, () => ({ path: here + '/src/stubs/use-theme.ts' }));
    build.onResolve({ filter: /^@\/store\/settings-store$/ }, () => ({ path: here + '/src/stubs/settings-store.ts' }));
    build.onResolve({ filter: /^@\// }, (a) => build.resolve('./' + a.path.slice(2), { resolveDir: K + '/src', kind: a.kind }));
    build.onResolve({ filter: /^react-native$/ }, (a) => build.resolve('react-native-web', { resolveDir: K, kind: a.kind }));
  },
};
await esbuild.build({
  entryPoints: { main: here + '/src/main.ts', koala: here + '/src/koala-web.tsx' },
  bundle: true, format: 'iife', outdir: out, minify: true, target: 'es2020',
  nodePaths: [K + '/node_modules'],
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.jsx', '.json'],
  mainFields: ['browser', 'module', 'main'],
  define: { 'process.env.NODE_ENV': '"production"', __DEV__: 'false', global: 'globalThis', 'process.env.EXPO_OS': '"web"' },
  external: ['fs', 'path'], banner: { js: 'var process=globalThis.process||{env:{NODE_ENV:"production"}};' },
  plugins: [aliases, babelPlugin],
  logLevel: 'warning', ignoreAnnotations: true,
  metafile: true,
}).then((r) => console.log(Object.entries(r.metafile.outputs).map(([f, o]) => f + ' ' + (o.bytes / 1024).toFixed(0) + 'K').join('\n')));
fs.copyFileSync(require.resolve('canvaskit-wasm/bin/full/canvaskit.wasm'), out + '/canvaskit.wasm');
