import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

console.log('Building and validating Commerce Dock assets...');

// 1. Verify existence of required core files
const requiredFiles = [
  'index.html',
  'nginx.conf',
  'Dockerfile',
  'docker-compose.yml',
  'src/css/style.css',
  'src/js/vault.js',
  'src/js/app.js',
  'src/js/theme.js',
  'src/js/icons.js'
];

for (const rel of requiredFiles) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`Build error: Missing required file ${rel}`);
    process.exit(1);
  }
}

// 2. Verify all presets in src/presets
const presetsDir = path.join(ROOT, 'src/presets');
if (fs.existsSync(presetsDir)) {
  const files = fs.readdirSync(presetsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(presetsDir, file), 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.dockId || !parsed.title || !Array.isArray(parsed.services)) {
      console.error(`Build error: Preset ${file} is missing required fields (dockId, title, services)`);
      process.exit(1);
    }
  }
  console.log(`Validated ${files.length} operational stack presets.`);
}

console.log('Commerce Dock build verification passed successfully.');
