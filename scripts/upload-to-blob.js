#!/usr/bin/env node

/**
 * Upload newsletter to Vercel Blob
 * Run this after creating newsletter content
 */

const fs = require('fs');
const path = require('path');

// Read the newsletter file
const today = new Date().toISOString().split('T')[0];
const newsletterPath = path.join(__dirname, '..', 'data', `newsletter-${today}.json`);
const digestPath = path.join(__dirname, '..', 'data', 'newsletter-digest.json');

// Check if file exists
if (!fs.existsSync(digestPath)) {
  console.error(`❌ File not found: ${digestPath}`);
  process.exit(1);
}

// Read content
const newsletter = JSON.parse(fs.readFileSync(digestPath, 'utf-8'));

console.log('📰 Newsletter to upload:');
console.log(`   Date: ${newsletter.digestDate}`);
console.log(`   Title: ${newsletter.article.title}`);
console.log(`   Word count: ${newsletter.metadata.wordCount}`);
console.log(`   Read time: ${newsletter.metadata.readTime}`);
console.log('');

// Instructions for manual upload
console.log('📋 Upload instructions:');
console.log('');
console.log('Option A: Use the Blob Manager UI');
console.log('   1. Visit: https://kanban-ops-eta.vercel.app/blob-manager');
console.log('   2. (Upload feature coming soon)');
console.log('');
console.log('Option B: Use curl with Vercel Blob API');
console.log('   Run this command:');
console.log('');
console.log('   curl -X POST "https://$BLOB_READ_WRITE_TOKEN.blob.vercel-storage.com/newsletter/' + newsletter.digestDate + '.json" \\');
console.log('     -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d @' + digestPath);
console.log('');
console.log('Option C: Use Next.js API route');
console.log('   POST to: https://kanban-ops-eta.vercel.app/api/blob');
console.log('   Body: { "pathname": "newsletter/' + newsletter.digestDate + '.json", "content": <file_content> }');
console.log('');

// Next steps
console.log('✅ Next steps:');
console.log('   1. Upload to Blob using one of the methods above');
console.log('   2. Verify at: https://kanban-ops-eta.vercel.app/history');
console.log('   3. Commit and push:');
console.log('      cd ' + path.join(__dirname, '..'));
console.log('      git add data/newsletter-digest.json');
console.log('      git commit -m "Add newsletter ' + newsletter.digestDate + '"');
console.log('      git push origin main');
