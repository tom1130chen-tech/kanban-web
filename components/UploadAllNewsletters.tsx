"use client";

import { useState } from 'react';

export default function UploadAllNewsletters() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string }[] | null>(null);

  async function handleUpload() {
    setUploading(true);
    setResult(null);

    const files = [
      { name: 'newsletter-digest.json', dest: 'newsletter/2026-03-07.json', label: 'CitriniResearch Translation' },
      { name: 'newsletter-2026-03-07-special.json', dest: 'newsletter/2026-03-07-special.json', label: 'CKC335 Guest Article' }
    ];

    const results = [];

    for (const file of files) {
      try {
        // Fetch file content from public folder
        const res = await fetch(`/data/${file.name}`);
        const content = await res.text();
        
        // Upload to Blob via API
        const uploadRes = await fetch(`/api/upload-file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            src: file.name,
            dest: file.dest,
            content: content
          })
        });

        const data = await uploadRes.json();
        
        if (data.success) {
          results.push({
            success: true,
            message: `✅ ${file.label}: ${file.dest}`
          });
        } else {
          results.push({
            success: false,
            message: `❌ ${file.label}: ${data.error}`
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          message: `❌ ${file.label}: ${error.message}`
        });
      }
    }

    setResult(results);
    setUploading(false);
  }

  return (
    <div className="bg-white rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 p-6" style={{ boxShadow: "4px 4px 0px rgba(45,45,45,0.1)" }}>
      <h2 className="text-xl font-heading font-bold text-slate-900 mb-4">
        📤 Upload All Newsletters to Blob
      </h2>
      
      <p className="text-sm text-slate-600 mb-4">
        Upload both newsletter files to Blob storage automatically.
      </p>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-6 py-3 bg-accent text-white rounded-full font-heading uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        style={{ boxShadow: "3px 3px 0px var(--accent)" }}
      >
        {uploading ? 'Uploading...' : 'Upload Both Files'}
      </button>

      {result && (
        <div className="mt-4 space-y-2">
          {result.map((r, idx) => (
            <div key={idx} className={`p-3 rounded-[var(--r-wobbly-md)] border-2 ${
              r.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {r.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
