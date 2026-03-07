"use client";

import { useEffect, useState } from 'react';

interface NewsletterArchive {
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface NewsletterData {
  digestDate: string;
  article: {
    title: string;
    subtitle?: string;
    content: string;
    author?: string;
    tags?: string[];
    sources?: Array<{ name: string; url: string; summary?: string; type?: string }>;
  };
  metadata: {
    readTime: string;
    wordCount: number;
    language?: string;
  };
}

export default function HistoryPage() {
  const [archives, setArchives] = useState<NewsletterArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsletterData | null>(null);

  useEffect(() => {
    fetchArchives();
  }, []);

  async function fetchArchives() {
    try {
      const res = await fetch('/api/blob?prefix=newsletter/');
      const data = await res.json();
      if (data.success) {
        // Sort by date (newest first)
        const sorted = data.data.sort((a: NewsletterArchive, b: NewsletterArchive) => {
          const dateA = a.pathname.replace('newsletter/', '').replace('.json', '');
          const dateB = b.pathname.replace('newsletter/', '').replace('.json', '');
          return dateB.localeCompare(dateA);
        });
        setArchives(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch archives:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadArticle(pathname: string) {
    try {
      const res = await fetch(`/api/blob?pathname=${encodeURIComponent(pathname)}`);
      const data = await res.json();
      if (data.success) {
        setSelectedArticle(JSON.parse(data.data.body));
      }
    } catch (error) {
      console.error('Failed to load article:', error);
    }
  }

  function formatDate(pathname: string) {
    const dateStr = pathname.replace('newsletter/', '').replace('.json', '');
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10">
      {/* Header */}
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-4 py-1.5 mb-6" style={{ boxShadow: "3px 3px 0px var(--accent)" }}>
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          <span className="text-xs font-heading uppercase tracking-[0.3em] text-accent">
            Archive
          </span>
        </div>

        <h1 className="text-4xl font-heading font-bold text-slate-900 leading-tight mb-4">
          📚 News History
        </h1>
        <p className="text-lg text-slate-600">
          Browse all past Daily News articles
        </p>
      </header>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Archive List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 overflow-hidden" style={{ boxShadow: "4px 4px 0px rgba(45,45,45,0.1)" }}>
            <div className="bg-slate-50 px-4 py-3 border-b-[3px] border-slate-200">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                📰 Articles ({archives.length})
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : archives.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No archives yet</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {archives.map((archive) => (
                    <button
                      key={archive.pathname}
                      onClick={() => loadArticle(archive.pathname)}
                      className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-medium text-slate-900 text-sm">
                        {formatDate(archive.pathname)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(archive.size / 1024).toFixed(1)} KB
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Preview */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <article className="bg-white rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 p-8" style={{ boxShadow: "4px 4px 0px rgba(45,45,45,0.1)" }}>
              <header className="mb-6">
                <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">
                  {selectedArticle.article.title}
                </h2>
                {selectedArticle.article.subtitle && (
                  <p className="text-lg text-slate-600">
                    {selectedArticle.article.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                  {selectedArticle.article.author && (
                    <span>By <strong>{selectedArticle.article.author}</strong></span>
                  )}
                  {selectedArticle.metadata?.readTime && (
                    <>
                      <span>•</span>
                      <span>{selectedArticle.metadata.readTime} read</span>
                    </>
                  )}
                  {selectedArticle.digestDate && (
                    <>
                      <span>•</span>
                      <span>{new Date(selectedArticle.digestDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </header>

              <div 
                className="news-article prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.article.content }}
              />

              {/* Sources */}
              {selectedArticle.article.sources && selectedArticle.article.sources.length > 0 && (
                <section className="mt-12 pt-6 border-t-2 border-dashed border-slate-200">
                  <h3 className="text-sm font-heading uppercase tracking-[0.3em] text-slate-500 mb-4">
                    Sources
                  </h3>
                  <div className="space-y-2">
                    {selectedArticle.article.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-[var(--r-wobbly-md)] border-2 border-slate-200 hover:border-accent transition-colors"
                      >
                        <p className="font-medium text-slate-900">{source.name}</p>
                        {source.summary && (
                          <p className="text-sm text-slate-600 mt-1">{source.summary}</p>
                        )}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </article>
          ) : (
            <div className="bg-white rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 p-12 text-center" style={{ boxShadow: "4px 4px 0px rgba(45,45,45,0.1)" }}>
              <p className="text-2xl mb-4">📰</p>
              <p className="text-lg text-slate-600">Select an article from the archive to read</p>
              <p className="text-sm text-slate-500 mt-2">Click on any date in the left panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Back to Today */}
      <div className="mt-8 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-heading uppercase tracking-[0.2em] text-xs hover:bg-accent/90 transition-colors"
          style={{ boxShadow: "3px 3px 0px var(--accent)" }}
        >
          ← Back to Today
        </a>
      </div>
    </main>
  );
}
