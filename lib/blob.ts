/**
 * Vercel Blob Storage Helper
 * For storing newsletter articles, archives, and other content
 */

const BLOB_BASE = '/api/blob';

export interface BlobFile {
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

/**
 * Upload content to blob storage
 */
export async function uploadToBlob(
  pathname: string,
  content: string | Blob,
  contentType: string = 'application/json'
): Promise<BlobFile> {
  const response = await fetch(BLOB_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pathname, content, contentType }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.data;
}

/**
 * Get content from blob storage
 */
export async function getFromBlob(pathname: string): Promise<string> {
  const response = await fetch(`${BLOB_BASE}?pathname=${encodeURIComponent(pathname)}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Fetch failed');
  }
  
  // If it's a text-based content, return the body
  return result.data.body;
}

/**
 * List files in blob storage
 */
export async function listBlobFiles(prefix: string = ''): Promise<BlobFile[]> {
  const url = prefix 
    ? `${BLOB_BASE}?prefix=${encodeURIComponent(prefix)}`
    : BLOB_BASE;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'List failed');
  }
  
  return result.data;
}

/**
 * Delete file from blob storage
 */
export async function deleteFromBlob(pathname: string): Promise<void> {
  const response = await fetch(`${BLOB_BASE}?pathname=${encodeURIComponent(pathname)}`, {
    method: 'DELETE',
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Delete failed');
  }
}

// ============ Newsletter-specific helpers ============

/**
 * Save newsletter article to blob
 * Path: newsletter/YYYY-MM-DD.json
 */
export async function saveNewsletter(date: string, content: any): Promise<BlobFile> {
  const pathname = `newsletter/${date}.json`;
  return uploadToBlob(pathname, JSON.stringify(content, null, 2));
}

/**
 * Get newsletter article from blob
 */
export async function getNewsletter(date: string): Promise<any> {
  const pathname = `newsletter/${date}.json`;
  const body = await getFromBlob(pathname);
  return JSON.parse(body);
}

/**
 * List all newsletter articles
 */
export async function listNewsletters(): Promise<BlobFile[]> {
  return listBlobFiles('newsletter/');
}
