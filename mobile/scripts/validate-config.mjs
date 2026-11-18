import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const config = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf8');

const required = [
  ['app id', "appId: 'org.kovcareeragency.app'"],
  ['app name', "appName: 'KOV Career Agency'"],
  ['live site URL', "url: 'https://www.kovcareeragency.org'"],
  ['HTTPS only', 'cleartext: false'],
  ['offline fallback', "errorPath: 'offline.html'"]
];

for (const [label, value] of required) {
  if (!config.includes(value)) throw new Error(`Missing or invalid ${label} in Capacitor config.`);
}

for (const dependency of ['@capacitor/core', '@capacitor/android', '@capacitor/ios', '@capacitor/cli']) {
  if (!pkg.dependencies?.[dependency] && !pkg.devDependencies?.[dependency]) {
    throw new Error(`Missing required dependency: ${dependency}`);
  }
}

for (const file of ['www/index.html', 'www/offline.html', 'assets/logo.png']) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing mobile asset: ${file}`);
}

console.log('KOV mobile configuration checks passed.');
