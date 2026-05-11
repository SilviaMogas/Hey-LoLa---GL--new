import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// Rasterise public/og-image.svg → public/og-image.png so social platforms
// that don't support SVG (WhatsApp, Twitter, iMessage, Facebook) can render
// the link preview. Run via `npm run build:og` or as part of the build chain.

const svg = readFileSync('public/og-image.svg', 'utf8');
const resvg = new Resvg(svg, {
  background: '#F5F2ED',
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: false },
});
const png = resvg.render().asPng();
writeFileSync('public/og-image.png', png);
console.log(`og-image.png written (${png.length} bytes)`);
