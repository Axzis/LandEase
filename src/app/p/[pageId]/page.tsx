'use client';

import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { initializeFirebase } from '@/firebase';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';
import { PageContent } from '@/lib/types';

interface PageData {
  content: PageContent;
  pageName: string;
  pageBackgroundColor?: string;
  published: boolean;
  userId: string;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      
      // 1. Try to get data from localStorage first (for live preview)
      try {
        const previewDataString = localStorage.getItem(`preview_${pageId}`);
        if (previewDataString) {
          const previewData: PageData = JSON.parse(previewDataString);
          setPageData(previewData);
          setIsLoading(false);
          // Optional: clear the preview data after use
          // localStorage.removeItem(`preview_${pageId}`);
          return;
        }
      } catch (e) {
        console.warn("Could not read preview data from localStorage", e);
      }

      // 2. If not in localStorage, fetch from Firestore
      try {
        const { firestore } = initializeFirebase();
        const pageDocRef = doc(firestore, 'pages', pageId);
        const pageSnap = await getDoc(pageDocRef);

        if (pageSnap.exists()) {
          const data = pageSnap.data() as PageData;
          if (data.published) {
            setPageData(data);
          } else {
            setError("Halaman ini tidak dipublikasikan.");
          }
        } else {
          setError("Halaman tidak ditemukan.");
        }
      } catch (err: any) {
        console.error("Error fetching public page data:", err);
        setError(err.message || "Gagal memuat halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className='text-center'>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className='text-muted-foreground'>Memuat halaman...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className='text-center'>
                <h1 className='text-2xl font-bold'>Halaman Tidak Tersedia</h1>
                <p className='text-muted-foreground'>{error || "Halaman yang Anda cari tidak ada atau tidak dipublikasikan."}</p>
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
