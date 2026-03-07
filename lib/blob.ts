/**
 * Vercel Blob Storage Helper
 * For storing newsletter articles, archives, and other content
 * 
 * Directory Structure:
 * - newsletter/YYYY-MM-DD.json  - Daily news articles
 * - board-state/YYYY-MM-DD.json - Board state backups
 * - calendar/events.json        - Calendar events
 * - finance/watchlist.json      - Financial watchlist
 * - focus/rituals.json          - Focus rituals
 */

const BLOB_BASE = '/api/blob';

export interface BlobFile {
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface NewsletterArticle {
  digestDate: string;
  article: {
    title: string;
    subtitle?: string;
    content: string;
    author?: string;
    sources: Array<{ name: string; url: string; summary?: string; type?: string }>;
    tags?: string[];
  };
  metadata: {
    wordCount: number;
    readTime: string;
    language: string;
  };
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
export async function saveNewsletter(date: string, content: NewsletterArticle): Promise<BlobFile> {
  const pathname = `newsletter/${date}.json`;
  return uploadToBlob(pathname, JSON.stringify(content, null, 2));
}

/**
 * Get newsletter article from blob
 */
export async function getNewsletter(date: string): Promise<NewsletterArticle> {
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

/**
 * Get latest newsletter
 */
export async function getLatestNewsletter(): Promise<NewsletterArticle | null> {
  const newsletters = await listNewsletters();
  if (newsletters.length === 0) return null;
  
  // Sort by date (newest first)
  const sorted = newsletters.sort((a, b) => {
    const dateA = a.pathname.replace('newsletter/', '').replace('.json', '');
    const dateB = b.pathname.replace('newsletter/', '').replace('.json', '');
    return dateB.localeCompare(dateA);
  });
  
  const latest = sorted[0];
  const date = latest.pathname.replace('newsletter/', '').replace('.json', '');
  return getNewsletter(date);
}

// ============ Board State helpers ============

/**
 * Save board state backup to blob
 * Path: board-state/YYYY-MM-DD.json
 */
export async function saveBoardState(date: string, state: any): Promise<BlobFile> {
  const pathname = `board-state/${date}.json`;
  return uploadToBlob(pathname, JSON.stringify(state, null, 2));
}

/**
 * Get board state from blob
 */
export async function getBoardState(date: string): Promise<any> {
  const pathname = `board-state/${date}.json`;
  const body = await getFromBlob(pathname);
  return JSON.parse(body);
}

/**
 * List all board state backups
 */
export async function listBoardStates(): Promise<BlobFile[]> {
  return listBlobFiles('board-state/');
}

// ============ Calendar helpers ============

/**
 * Save calendar events
 * Path: calendar/events.json
 */
export async function saveCalendarEvents(events: any[]): Promise<BlobFile> {
  return uploadToBlob('calendar/events.json', JSON.stringify(events, null, 2));
}

/**
 * Get calendar events
 */
export async function getCalendarEvents(): Promise<any[]> {
  const body = await getFromBlob('calendar/events.json');
  return JSON.parse(body);
}

// ============ Finance helpers ============

/**
 * Save financial watchlist
 * Path: finance/watchlist.json
 */
export async function saveFinanceWatchlist(data: any): Promise<BlobFile> {
  return uploadToBlob('finance/watchlist.json', JSON.stringify(data, null, 2));
}

/**
 * Get financial watchlist
 */
export async function getFinanceWatchlist(): Promise<any> {
  const body = await getFromBlob('finance/watchlist.json');
  return JSON.parse(body);
}

// ============ Focus helpers ============

/**
 * Save focus rituals
 * Path: focus/rituals.json
 */
export async function saveFocusRituals(rituals: string[]): Promise<BlobFile> {
  return uploadToBlob('focus/rituals.json', JSON.stringify(rituals, null, 2));
}

/**
 * Get focus rituals
 */
export async function getFocusRituals(): Promise<string[]> {
  const body = await getFromBlob('focus/rituals.json');
  return JSON.parse(body);
}
