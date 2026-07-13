import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

const items = [
  'methodosync',
  'banned-words',
  'mc-careers-dashboard',
  'captionizer.html',
  'countdown.html',
  'app_form.html',
  // Legacy stylesheets/scripts the standalone HTML pages above load by
  // relative path (css/style.css, js/countdown.js, …). Without these the
  // Captionizer and Countdown pages render unstyled.
  'css',
  'js',
  // Self-hosted assets so the standalone pages make no external requests:
  // fonts (Inter/Lexend/Public Sans), Font Awesome (Captionizer icons),
  // and the vendored Tailwind Play compiler (app_form).
  'fonts',
  'fontawesome',
  'vendor',
  '_archive',
];

await mkdir(dist, { recursive: true });

for (const item of items) {
  const src = path.join(root, item);
  if (!existsSync(src)) {
    console.warn(`skip (not found): ${item}`);
    continue;
  }
  const dst = path.join(dist, item);
  await cp(src, dst, { recursive: true });
  console.log(`copied: ${item}`);
}
