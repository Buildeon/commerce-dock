import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FORBIDDEN_REMOTE_PATTERNS = [
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /unpkg\.com/i,
  /cdn\.jsdelivr\.net/i,
  /google\.com\/s2\/favicons/i,
  /icon\.horse/i
];

let errors = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Check for remote CDN tracking URLs
  for (const pattern of FORBIDDEN_REMOTE_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`[GDPR LINT ERROR] Prohibited remote resource detected in ${filePath}: ${pattern}`);
      errors++;
    }
  }

  // 2. In HTML files, check for external target="_blank" without rel="noopener noreferrer"
  if (filePath.endsWith('.html')) {
    const anchorMatches = content.matchAll(/<a\s+[^>]*target=["']_blank["'][^>]*>/gi);
    for (const match of anchorMatches) {
      const tag = match[0];
      if (!/rel=["'][^"']*noopener[^"']*["']/i.test(tag) || !/rel=["'][^"']*noreferrer[^"']*["']/i.test(tag)) {
        console.error(`[SECURITY LINT ERROR] Missing rel="noopener noreferrer" in ${filePath}: ${tag}`);
        errors++;
      }
    }
  }

  // 3. In JSON files, verify valid JSON syntax
  if (filePath.endsWith('.json')) {
    try {
      JSON.parse(content);
    } catch (e) {
      console.error(`[SYNTAX LINT ERROR] Invalid JSON in ${filePath}: ${e.message}`);
      errors++;
    }
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(html|css|js|mjs|json)$/i.test(entry.name)) {
      checkFile(fullPath);
    }
  }
}

console.log('Running compliance and security lint audit...');
walkDir(ROOT);

if (errors > 0) {
  console.error(`Lint audit failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('Lint audit passed: 0 GDPR violations, 0 insecure external anchors, all JSON valid.');
}
