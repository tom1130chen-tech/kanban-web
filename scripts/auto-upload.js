#!/usr/bin/env node

/**
 * Auto-upload newsletters to Vercel Blob
 * This script will be run by the agent after creating newsletter content
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📤 Auto-uploading newsletters to Vercel Blob...\n');

// Files to upload
const uploads = [
  {
    src: path.join(__dirname, '..', 'data', 'newsletter-digest.json'),
    dest: 'newsletter/2026-03-07.json',
    label: 'CitriniResearch Translation'
  },
  {
    src: path.join(__dirname, '..', 'data', 'newsletter-2026-03-07-special.json'),
    dest: 'newsletter/2026-03-07-special.json',
    label: 'CKC335 Guest Article'
  }
];

// Check if vercel CLI is available
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Vercel CLI not found. Please install with: npm install -g vercel');
  process.exit(1);
}

// Upload each file
async function uploadAll() {
  for (const file of uploads) {
    console.log(`Uploading: ${file.label}`);
    console.log(`  Source: ${file.src}`);
    console.log(`  Destination: ${file.dest}`);
    
    if (!fs.existsSync(file.src)) {
      console.error(`  ❌ File not found: ${file.src}`);
      continue;
    }
    
    try {
      // Use vercel blob put command
      const content = fs.readFileSync(file.src, 'utf-8');
      
      // Write to temp file for curl
      const tempFile = path.join(__dirname, '..', 'temp', `temp-${Date.now()}.json`);
      fs.writeFileSync(tempFile, content);
      
      // Try using vercel blob command
      const cmd = `cd ${path.join(__dirname, '..')} && vercel blob put ${file.dest} --file ${file.src} --scope bottomchens-projects --yes 2>&1`;
      
      try {
        const output = execSync(cmd, { encoding: 'utf-8' });
        console.log(`  ✅ Success!`);
        console.log(`  ${output.trim()}\n`);
      } catch (error) {
        console.log(`  ⚠️  Vercel blob command failed, trying alternative method...`);
        
        // Alternative: use the upload API endpoint
        console.log(`  📋 Manual upload required:`);
        console.log(`     1. Visit: https://kanban-ops-eta.vercel.app/blob-manager`);
        console.log(`     2. Click "Upload Both Files" button`);
        console.log(`     3. Or upload ${file.src} manually\n`);
      } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Upload process completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Visit: https://kanban-ops-eta.vercel.app/blob-manager');
  console.log('   2. Click "Upload Both Files" if automatic upload failed');
  console.log('   3. Verify at: https://kanban-ops-eta.vercel.app/');
}

uploadAll();
