'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'PAGE_MANIFEST.json'), 'utf8'));
const files = manifest.repository_html_inventory.files.map((entry) => entry.path).sort();
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex');
const snapshot = () => new Map(files.map((file) => [file, hash(file)]));

function runBuild() {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-discovery-structured-data.js')], { cwd: ROOT, stdio: 'ignore' });
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-jsonld.js')], { cwd: ROOT, stdio: 'ignore' });
}

const before = snapshot();
runBuild();
const after = snapshot();
const changed = files.filter((file) => before.get(file) !== after.get(file));
if (changed.length) {
  console.error(JSON.stringify({ status: 'FAIL', htmlPages: files.length, changedPages: changed.length, examples: changed.slice(0, 20) }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: 'PASS', htmlPages: files.length, changedPages: 0, compared: 'SHA-256 of every manifest HTML file before and after discovery + taxonomy generators' }, null, 2));
}
