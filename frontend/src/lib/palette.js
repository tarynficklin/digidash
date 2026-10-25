// Background color palette extraction, done in the browser with node-vibrant's
// own building blocks (@vibrant/*). This replaces the old PUT /api/vibrant
// endpoint, whose server-side image decoding (node-vibrant -> jimp -> file-type)
// carried an unfixed advisory. Unsplash images are served with CORS headers,
// so the canvas can read them.
import { BasicPipeline, Vibrant } from '@vibrant/core';
import { DefaultGenerator } from '@vibrant/generator-default';
import { BrowserImage } from '@vibrant/image-browser';
import { MMCQ } from '@vibrant/quantizer-mmcq';

// Same pipeline/options as node-vibrant/browser.
const pipeline = new BasicPipeline().filter
  .register('default', (r, g, b, a) => a >= 125 && !(r > 250 && g > 250 && b > 250))
  .quantizer.register('mmcq', MMCQ)
  .generator.register('default', DefaultGenerator);

Vibrant.use(pipeline);
Object.assign(Vibrant.DefaultOpts, {
  ImageClass: BrowserImage,
  quantizer: 'mmcq',
  generators: ['default'],
  filters: ['default'],
});

const toRgb = (swatch) => (swatch ? swatch.rgb.map(Math.trunc).join(', ') : null);

// Resolves to { vibrant, muted, lightVibrant, lightMuted, darkVibrant, darkMuted },
// each an "r, g, b" string (or null), as the old endpoint returned.
export async function getPalette(imageUrl) {
  const palette = await Vibrant.from(imageUrl).getPalette();
  return {
    vibrant: toRgb(palette.Vibrant),
    muted: toRgb(palette.Muted),
    lightVibrant: toRgb(palette.LightVibrant),
    lightMuted: toRgb(palette.LightMuted),
    darkVibrant: toRgb(palette.DarkVibrant),
    darkMuted: toRgb(palette.DarkMuted),
  };
}
