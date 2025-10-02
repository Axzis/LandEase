'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { PageContent } from '@/lib/types';

// Definisikan tipe data untuk halaman publik
interface PublicPageData {
  content: PageContent;
  pageBackgroundColor: string;
  pageName: string;
  userId: string;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const firestore = useFirestore();

  // 🔥 PERBAIKAN 1: Kesalahan pengetikan `React.use(params)` telah diperbaiki
  const resolvedParams = React.use(params);
  const { pageId } = resolvedParams;

  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    
    // Pastikan ini mengarah ke koleksi 'publishedPages'
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  // 🔥 PERBAIKAN 2: Pastikan `useDoc` menggunakan tipe data yang benar
  const { data: pageData, isLoading, error } = useDoc<PublicPageData>(pageDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika error atau tidak ada data, tampilkan 404
  if (error || !pageData) {
     if (error) console.error("Error loading public page:", error.message);
     return notFound();
  }
  
  // Render halaman
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