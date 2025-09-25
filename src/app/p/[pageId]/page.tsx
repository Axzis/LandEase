'use client';

import { useState, useEffect } from 'react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';
import type { PageContent } from '@/lib/types';

// This interface must match the structure saved in editor-client.tsx
interface PagePreviewData {
  content: PageContent;
  pageName: string;
  pageBackgroundColor?: string;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
  const [pageData, setPageData] = useState<PagePreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      // This page ONLY works by reading preview data from localStorage.
      // It does NOT connect to Firebase.
      const previewDataString = localStorage.getItem(`preview_${pageId}`);
      if (previewDataString) {
        const previewData: PagePreviewData = JSON.parse(previewDataString);
        setPageData(previewData);
      } else {
        setError("Halaman tidak ditemukan. Pastikan Anda telah menyimpan perubahan di editor untuk mengaktifkan pratinjau langsung.");
      }
    } catch (e) {
      console.error("Could not read preview data from localStorage", e);
      setError("Gagal memuat data pratinjau dari penyimpanan lokal.");
    } finally {
      setIsLoading(false);
    }
    
    // We only run this once on mount.
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className='text-center'>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className='text-muted-foreground'>Memuat pratinjau...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className='text-center p-4'>
                <h1 className='text-2xl font-bold'>Pratinjau Tidak Tersedia</h1>
                <p className='text-muted-foreground max-w-md'>{error}</p>
            </div>
        </div>
    );
  }

  return (
    <div style={{ backgroundColor: pageData.pageBackgroundColor || '#FFFFFF' }}>
      <EditorCanvas
        content={pageData.content}
        readOnly
        pageId={pageId}
        pageName={pageData.pageName}
      />
    </div>
  );
}
