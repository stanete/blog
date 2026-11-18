/**
 * The blog's koala, drawn by the app's own Skia code (CanvasKit on the web). The page shows
 * the icon first; once Skia has loaded, the moving koala takes its place.
 */
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';

const koala = document.querySelector<HTMLElement>('.koala[data-skia]');
const host = koala?.querySelector<HTMLElement>('.koala-breath');
// Saves the 8 MB of CanvasKit for people who asked their browser to save data.
const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
if (host && !saveData && typeof WebAssembly === 'object') {
  // Where CanvasKit's wasm file is served from.
  const here = koala!.dataset.skia!;
  LoadSkiaWeb({ locateFile: (file: string) => here + file })
    .then(() => {
      // The koala's own code reads CanvasKit as it loads, so it comes after.
      const script = document.createElement('script');
      script.src = here + 'koala.js';
      document.head.appendChild(script);
    })
    .catch(() => {});
}
