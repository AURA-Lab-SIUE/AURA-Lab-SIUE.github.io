import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

const items = [
  'methodosync',
  'captionizer.html',
  'countdown.html',
  'app_form.html',
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
