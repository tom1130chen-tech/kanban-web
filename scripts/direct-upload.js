#!/usr/bin/env node

/**
 * Direct upload to Vercel Blob using vercel CLI
 * This bypasses the API route and uploads directly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📤 Direct upload to Vercel Blob...\n');

const files = [
  { src: 'data/newsletter-digest.json', dest: 'newsletter/2026-03-07.json', label: 'CitriniResearch Translation' },
  { src: 'data/newsletter-2026-03-07-special.json', dest: 'newsletter/2026-03-07-special.json', label: 'CKC335 Guest Article' }
];

const cwd = path.join(__dirname, '..');

files.forEach(file => {
  const srcPath = path.join(cwd, file.src);
  
  if (!fs.existsSync(srcPath)) {
    console.error(`❌ File not found: ${srcPath}`);
    return;
  }
  
  console.log(`Uploading: ${file.label}`);
  console.log(`  Source: ${file.src}`);
  console.log(`  Destination: ${file.dest}`);
  
  try {
    // Use vercel blob put with --yes flag to skip confirmation
    const cmd = `vercel blob put "${file.dest}" --file "${srcPath}" --scope bottomchens-projects --yes`;
    console.log(`  Running: ${cmd}`);
    
    const output = execSync(cmd, { 
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    console.log(`  ✅ Success!`);
    console.log(`  ${output.trim()}\n`);
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    if (error.stdout) console.log(`  ${error.stdout}`);
    if (error.stderr) console.log(`  ${error.stderr}`);
    console.log('');
  }
});

console.log('✅ Upload process completed!');
console.log('\n📋 Verify at: https://kanban-ops-eta.vercel.app/blob-manager');
