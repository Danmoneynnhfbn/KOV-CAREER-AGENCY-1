import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const config = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf8');

const required = [
  ['app id', /appId:\s*'org\\.kovcareeragency\\.app'/],
  ['app name', /appName:\s*'KOV Career Agency'/],
  ['live site URL', /url:\s*'https:\/\/www\\.kovcareeragency\\.org'/],
  ['HTTPS only', /cleartext:\s*false/],
  ['offline fallback', /errorPath:\s*'offline\\.html'/]
];

for (const [label, pattern] of required) {
  if (!pattern.test(config)) throw new Error(`Missing or invalid ${label} in Capacitor config.`);
}

for (const dependency of ['@capacitor/core', '@capacitor/android', '@capacitor/ios', '@capacitor/cli']) {
  if (!pkg.dependencies?.[dependency] && !pkg.devDependencies?.[dependency]) {
    throw new Error(`Missing required dependency: ${dependency}`);
  }
}

for (const file of ['www/index.html', 'www/offline.html']) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing mobile asset: ${file}`);
}

console.log('KOV mobile configuration checks passed.');
