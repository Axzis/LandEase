'use client';

import React, { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { PageContent } from '@/lib/types';

interface PublicPageData {
  content: PageContent;
  pageBackgroundColor: string;
  pageName: string;
  userId: string;
}

export default function PublicPage() {
  const firestore = useFirestore();
  const params = useParams();
  
  // Cara paling stabil untuk mendapatkan ID halaman di komponen klien
  const pageId = typeof params.pageId === 'string' ? params.pageId : null;
  
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  const { data: pageData, isLoading, error } = useDoc<PublicPageData>(pageDocRef);

  // Tampilkan loading jika ID belum siap atau data sedang diambil
  if (isLoading || !pageId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika ada error atau data tidak ditemukan setelah loading selesai, tampilkan 404
  if (error || !pageData) {
     if (error) {
        console.error("Gagal memuat halaman publik:", error.message);
     }
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