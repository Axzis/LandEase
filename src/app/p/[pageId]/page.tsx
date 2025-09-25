'use client';

import { useState, useEffect } from 'react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';
import type { PageContent } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

interface PageData {
  content: PageContent;
  pageName: string;
  pageBackgroundColor?: string;
  published?: boolean;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) {
      setError('ID halaman tidak valid.');
      setIsLoading(false);
      return;
    }

    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        // Inisialisasi Firebase di sisi klien
        const { firestore } = initializeFirebase();
        const pageRef = doc(firestore, 'pages', pageId);
        const docSnap = await getDoc(pageRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as PageData;
          // Periksa apakah halaman sudah dipublikasikan
          if (data.published) {
            setPageData(data);
          } else {
            setError('Halaman ini belum dipublikasikan.');
          }
        } else {
          setError('Halaman tidak ditemukan.');
        }
      } catch (e) {
        console.error('Gagal mengambil data halaman:', e);
        setError('Terjadi kesalahan saat memuat halaman.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
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
