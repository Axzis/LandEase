'use client';

import { useState, useEffect } from 'react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';
import type { PageContent } from '@/lib/types';
import { getPublishedPage } from '@/lib/published-pages';

interface PageData {
  content: PageContent;
  pageName: string;
  pageBackgroundColor?: string;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Ini sekarang membaca dari file statis, bukan dari Firestore.
    const data = getPublishedPage(pageId);

    if (data) {
      setPageData(data);
    } else {
      setError('Halaman ini tidak ditemukan atau belum dipublikasikan.');
    }

    setIsLoading(false);
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">Halaman Tidak Tersedia</h1>
          <p className="max-w-md text-muted-foreground">{error}</p>
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
