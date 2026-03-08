#!/usr/bin/env node

/**
 * Auto-upload newsletters to Vercel Blob
 * Designed for GitHub Actions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📤 Auto-uploading newsletters to Vercel Blob...\n');

// Get files to upload - look for all newsletter JSON files in data/
const dataDir = path.join(__dirname, '..', 'data');
const files = [];

// Find all newsletter files
fs.readdirSync(dataDir)
  .filter(f => f.startsWith('newsletter-') && f.endsWith('.json'))
  .forEach(f => {
    files.push({
      src: path.join(dataDir, f),
      dest: `newsletter/${f}`,
      label: f.replace('.json', '').replace(/-/g, ' ')
    });
  });

console.log(`Found ${files.length} files to upload:\n`);
files.forEach(f => console.log(`  - ${f.label}`));
console.log('');

// Upload each file
let successCount = 0;
let failCount = 0;

files.forEach(file => {
  if (!fs.existsSync(file.src)) {
    console.error(`❌ File not found: ${file.src}`);
    failCount++;
    return;
  }
  
  try {
    // Use vercel blob put command
    const cmd = `vercel blob put "${file.dest}" --file "${file.src}" --yes 2>&1`;
    console.log(`Uploading: ${file.label}`);
    console.log(`  → ${file.dest}`);
    
    const output = execSync(cmd, { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      env: process.env
    });
    
    console.log(`  ✅ Success!\n`);
    successCount++;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ Upload completed: ${successCount} succeeded, ${failCount} failed`);
console.log('='.repeat(60));

// Don't fail the workflow even if some uploads fail
process.exit(0);
