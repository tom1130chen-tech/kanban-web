"use client";

import { useEffect, useState } from 'react';

interface BlobFile {
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export default function BlobManager() {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      const res = await fetch('/api/blob');
      const data = await res.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteFile(pathname: string) {
    if (!confirm(`Delete ${pathname}?`)) return;
    
    try {
      const res = await fetch(`/api/blob?pathname=${encodeURIComponent(pathname)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('Deleted successfully');
        fetchFiles();
      } else {
        alert('Delete failed: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Delete failed');
    }
  }

  const filteredFiles = files.filter(f => 
    !filter || f.pathname.toLowerCase().includes(filter.toLowerCase())
  );

  // Group by folder
  const grouped = filteredFiles.reduce((acc, file) => {
    const folder = file.pathname.split('/')[0] || 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(file);
    return acc;
  }, {} as Record<string, BlobFile[]>);

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Blob Storage Manager</h1>
          <p className="text-slate-600">Manage files in Vercel Blob storage</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
            <p className="text-sm text-slate-500">Total Files</p>
            <p className="text-2xl font-bold">{files.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
            <p className="text-sm text-slate-500">Folders</p>
            <p className="text-2xl font-bold">{Object.keys(grouped).length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
            <p className="text-sm text-slate-500">Total Size</p>
            <p className="text-2xl font-bold">
              {(files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>

        {/* Filter */}
        <input
          type="text"
          placeholder="Filter files..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-3 mb-6 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-red-500"
        />

        {/* File List */}
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([folder, folderFiles]) => (
              <div key={folder} className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b-2 border-slate-200">
                  <h2 className="font-bold text-lg text-slate-900">
                    📁 {folder}/ ({folderFiles.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {folderFiles.map((file) => (
                    <div key={file.pathname} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{file.pathname}</p>
                        <p className="text-sm text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteFile(file.pathname)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-white rounded-lg border-2 border-slate-200">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFilter('newsletter/')}
              className="p-3 bg-slate-100 rounded hover:bg-slate-200 text-left"
            >
              📰 View Newsletters
            </button>
            <button
              onClick={() => setFilter('board-state/')}
              className="p-3 bg-slate-100 rounded hover:bg-slate-200 text-left"
            >
              📋 View Board States
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
