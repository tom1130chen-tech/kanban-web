#!/usr/bin/env node

/**
 * Upload all newsletter files to Vercel Blob
 */

const fs = require('fs');
const path = require('path');

// Newsletter files to upload
const files = [
  {
    src: 'data/newsletter-digest.json',
    dest: 'newsletter/2026-03-07.json',
    label: 'CitriniResearch Translation'
  },
  {
    src: 'data/newsletter-2026-03-07-special.json',
    dest: 'newsletter/2026-03-07-special.json',
    label: 'CKC335 Guest Article'
  }
];

console.log('📤 Uploading newsletters to Blob...\n');

files.forEach((file, idx) => {
  const filePath = path.join(__dirname, '..', file.src);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const newsletter = JSON.parse(content);
  
  console.log(`${idx + 1}. ${file.label}`);
  console.log(`   Source: ${file.src}`);
  console.log(`   Destination: ${file.dest}`);
  console.log(`   Date: ${newsletter.digestDate}`);
  console.log(`   Title: ${newsletter.article.title}`);
  console.log(`   Word count: ${newsletter.metadata.wordCount}`);
  console.log('');
});

console.log('📋 Manual upload instructions:');
console.log('');
console.log('Option A: Use Blob Manager UI');
console.log('   1. Visit: https://kanban-ops-eta.vercel.app/blob-manager');
console.log('   2. Upload each file manually');
console.log('');
console.log('Option B: Use curl');
console.log('');
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file.src);
  console.log(`   curl -X POST "https://$BLOB_READ_WRITE_TOKEN.blob.vercel-storage.com/${file.dest}" \\`);
  console.log(`     -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d @${filePath}`);
  console.log('');
});

console.log('Option C: Use the upload component in blob-manager page');
console.log('   (Already implemented, just need to select files)');
