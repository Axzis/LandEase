

'use client';

import React, { use, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { PublishedPage } from '@/lib/types';


export default function PublicPage({ params }: { params: { pageId: string } }) {
  const firestore = useFirestore();
  
  // PERBAIKAN 1: Gunakan React.use() untuk mendapatkan params
  const resolvedParams = use(params);
  const { pageId } = resolvedParams;
  
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    
    // PERBAIKAN 2: Pastikan ini mengarah ke 'publishedPages'
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  const { data: pageData, isLoading, error } = useDoc<PublishedPage>(pageDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika ada error ATAU jika loading selesai dan masih tidak ada data,
  // itu berarti halaman tersebut tidak ada atau tidak dipublikasikan.
  if (error || !pageData) {
     if (error) console.error("Error loading public page:", error.message);
     notFound();
  }
  
  // Tidak perlu memeriksa pageData.published, karena keberadaannya di koleksi ini
  // mengonfirmasi bahwa halaman tersebut bersifat publik.

  return (
    <div style={{ backgroundColor: pageData.pageBackgroundColor || '#FFFFFF' }}>
      <EditorCanvas
        content={pageData.content}
        readOnly
        pageId={pageData.pageId}
        pageName={pageData.pageName}
      />
    </div>
  );
}

    
