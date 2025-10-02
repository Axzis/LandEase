'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc, type DocumentData } from 'firebase/firestore'; // <-- Perubahan di sini
import { useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { PageContent } from '@/lib/types';

interface PublicPageData extends DocumentData {
  content: PageContent;
  pageBackgroundColor: string;
  pageName: string;
  userId: string;
}

export default function PublicPage() {
  const firestore = useFirestore();
  const params = useParams();
  const pageId = typeof params.pageId === 'string' ? params.pageId : null;

  const [pageData, setPageData] = useState<PublicPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !pageId) {
      setIsLoading(false);
      return;
    }

    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(firestore, 'publishedPages', pageId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPageData(docSnap.data() as PublicPageData);
        } else {
          // Jika docSnap.exists() false, berarti dokumen tidak ditemukan
          setPageData(null);
        }
      } catch (e: any) {
        console.error("Error saat mengambil dokumen:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [firestore, pageId]);

  if (isLoading || !pageId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Tampilkan 404 jika ada error atau data tidak ditemukan setelah loading
  if (error || !pageData) {
     return notFound();
  }
  
  // Render halaman jika data berhasil ditemukan
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