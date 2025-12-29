/**
 * Build script for Chrome Web Store packaging
 * Creates a zip file containing only the extension files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT = path.join(DIST, 'x-following-tab.zip');

// Files to include in the extension package
const EXTENSION_FILES = [
  'manifest.json',
  'content.js',
  'icons',
];

// Clean and create dist directory
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST);

// Verify all required files exist
console.log('Verifying extension files...');
for (const file of EXTENSION_FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Required file not found: ${file}`);
    process.exit(1);
  }
  console.log(`  ✓ ${file}`);
}

// Create zip file
console.log('\nCreating zip package...');
const filesToZip = EXTENSION_FILES.join(' ');

try {
  execSync(`zip -r "${OUTPUT}" ${filesToZip}`, {
    cwd: ROOT,
    stdio: 'inherit',
  });

  // Get file size
  const stats = fs.statSync(OUTPUT);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`\n✓ Build complete: dist/x-following-tab.zip (${sizeKB} KB)`);
  console.log('\nTo publish:');
  console.log('1. Go to https://chrome.google.com/webstore/devconsole');
  console.log('2. Upload dist/x-following-tab.zip');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
