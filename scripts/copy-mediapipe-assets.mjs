import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'node_modules', '@mediapipe', 'selfie_segmentation');
const target = join(root, 'public', 'mediapipe', 'selfie_segmentation');

await mkdir(target, { recursive: true });

const files = await readdir(source);
await Promise.all(
  files
    .filter((file) => file.startsWith('selfie_segmentation'))
    .map((file) => copyFile(join(source, file), join(target, file))),
);
