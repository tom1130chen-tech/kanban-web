"use client";

import { useState } from 'react';

export default function UploadNewsletter() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const newsletter = JSON.parse(content);
          
          // Validate structure
          if (!newsletter.digestDate || !newsletter.article?.title) {
            throw new Error('Invalid newsletter format');
          }

          // Upload to Blob
          const res = await fetch('/api/blob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pathname: `newsletter/${newsletter.digestDate}.json`,
              content: content,
              contentType: 'application/json'
            })
          });

          const data = await res.json();
          
          if (data.success) {
            setResult({
              success: true,
              message: `✅ Uploaded ${newsletter.digestDate}: ${newsletter.article.title}`
            });
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (error: any) {
          setResult({
            success: false,
            message: `❌ Error: ${error.message}`
          });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Error: ${error.message}`
      });
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 p-6" style={{ boxShadow: "4px 4px 0px rgba(45,45,45,0.1)" }}>
      <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">
        📤 Upload Newsletter
      </h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select newsletter JSON file
          </label>
          <input
            type="file"
            accept=".json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-2
              file:border-slate-300 file:bg-white
              file:text-slate-700 file:font-heading
              file:uppercase file:tracking-wider file:text-xs
              hover:file:border-accent hover:file:text-accent
              transition-colors cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="px-6 py-2 bg-accent text-white rounded-full font-heading uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          style={{ boxShadow: "3px 3px 0px var(--accent)" }}
        >
          {uploading ? 'Uploading...' : 'Upload to Blob'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-[var(--r-wobbly-md)] border-2 ${
          result.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {result.message}
        </div>
      )}

      {/* Template download */}
      <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200">
        <p className="text-sm text-slate-600 mb-2">
          📝 Need a template?
        </p>
        <a
          href="/data/newsletter-digest.json"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          Download current newsletter template →
        </a>
      </div>
    </div>
  );
}
