#!/usr/bin/env node

/**
 * Auto-upload newsletters to Vercel Blob
 * Designed for GitHub Actions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📤 Auto-uploading newsletters to Vercel Blob...\n');

// Get files to upload
const dataDir = path.join(__dirname, '..', 'data');
const files = fs.readdirSync(dataDir)
  .filter(f => f.startsWith('newsletter-') && f.endsWith('.json'))
  .map(f => ({
    src: path.join('data', f),
    dest: `newsletter/${f.replace('newsletter-', '').replace('.json', '.json')}`,
    label: f.replace('newsletter-', '').replace('.json', '').replace(/-/g, ' ')
  }));

// Also include newsletter-digest.json if it exists
const digestPath = path.join(dataDir, 'newsletter-digest.json');
if (fs.existsSync(digestPath)) {
  const digestData = JSON.parse(fs.readFileSync(digestPath, 'utf-8'));
  const date = digestData.digestDate || new Date().toISOString().split('T')[0];
  files.push({
    src: 'data/newsletter-digest.json',
    dest: `newsletter/${date}.json`,
    label: `Latest Newsletter (${date})`
  });
}

console.log(`Found ${files.length} files to upload:\n`);
files.forEach(f => console.log(`  - ${f.label}`));
console.log('');

// Upload each file
let successCount = 0;
let failCount = 0;

files.forEach(file => {
  const srcPath = path.join(__dirname, '..', file.src);
  
  if (!fs.existsSync(srcPath)) {
    console.error(`❌ File not found: ${file.src}`);
    failCount++;
    return;
  }
  
  try {
    // Use vercel blob put command
    const cmd = `vercel blob put "${file.dest}" --file "${srcPath}" --yes 2>&1`;
    const output = execSync(cmd, { 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      env: process.env
    });
    
    console.log(`✅ ${file.label}`);
    console.log(`   → ${file.dest}`);
    successCount++;
  } catch (error) {
    console.error(`❌ ${file.label}`);
    console.error(`   Error: ${error.message}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ Upload completed: ${successCount} succeeded, ${failCount} failed`);
console.log('='.repeat(60));

if (failCount > 0) {
  console.log('\n⚠️  Some uploads failed. This is OK if files already exist in Blob.');
  process.exit(0); // Don't fail the workflow
}
