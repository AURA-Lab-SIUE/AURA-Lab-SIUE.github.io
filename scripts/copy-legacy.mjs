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
  // Mass Comm redesign mockups + the body stylesheet SIUE Cascade pages
  // reference. Served at /masscomm-preview/ and /mc-body.css. Previously
  // uploaded to the server by hand (and outside git) — now versioned here
  // and carried by the build so a deploy can't drop them.
  'masscomm-preview',
  'mc-body.css',
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

// Never deploy `_source/` folders (working design source kept in the repo for
// versioning but not served — e.g. masscomm-preview/_source).
const isSource = (p) => /[\\/]_source([\\/]|$)/.test(p);

for (const item of items) {
  const src = path.join(root, item);
  if (!existsSync(src)) {
    console.warn(`skip (not found): ${item}`);
    continue;
  }
  const dst = path.join(dist, item);
  await cp(src, dst, { recursive: true, filter: (s) => !isSource(s) });
  console.log(`copied: ${item}`);
}
