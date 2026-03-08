#!/usr/bin/env node

/**
 * Upload today's newsletter to Vercel Blob
 */

const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const blobToken = envContent.match(/BLOB_READ_WRITE_TOKEN="([^"]+)"/)?.[1];

if (!blobToken) {
  console.error('❌ BLOB_READ_WRITE_TOKEN not found in .env.local');
  process.exit(1);
}

process.env.BLOB_READ_WRITE_TOKEN = blobToken;

const { put } = require('@vercel/blob');

const today = new Date().toISOString().split('T')[0];
const dataPath = path.join(__dirname, '..', 'data', 'newsletter-digest.json');

async function upload() {
  try {
    // Read the newsletter content
    const content = fs.readFileSync(dataPath, 'utf-8');
    const newsletter = JSON.parse(content);
    
    console.log('📤 Uploading to Vercel Blob...');
    console.log(`   Date: ${today}`);
    console.log(`   Title: ${newsletter.article.title}`);
    
    // Upload to blob
    const blob = await put(`newsletter/${today}.json`, content, {
      access: 'private',
      contentType: 'application/json',
    });
    
    console.log('\n✅ Upload successful!');
    console.log(`   URL: ${blob.url}`);
    console.log(`   Pathname: ${blob.pathname}`);
    console.log(`   Size: ${blob.size} bytes`);
    
    return blob;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

upload();
