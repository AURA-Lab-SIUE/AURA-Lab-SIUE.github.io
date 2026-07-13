// Rasterize an SVG file to PNG at exact pixel dimensions.
// Usage: node raster.mjs <in.svg> <out.png> <width> [height] [density]
import sharp from 'sharp';
const [,, inp, outp, wStr, hStr, dStr] = process.argv;
const width = parseInt(wStr, 10);
const height = hStr ? parseInt(hStr, 10) : null;
const density = dStr ? parseInt(dStr, 10) : 384; // high density so text/paths stay crisp
// width-only: preserve aspect (no fit). width+height: fill exactly.
const resize = height ? { width, height, fit: 'fill' } : { width };
await sharp(inp, { density })
  .resize(resize)
  .png({ compressionLevel: 9 })
  .toFile(outp);
const meta = await sharp(outp).metadata();
console.log(`${outp}  ${meta.width}x${meta.height}`);
