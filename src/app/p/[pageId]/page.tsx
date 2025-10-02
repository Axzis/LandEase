'use client';

import React, { useMemo, useEffect } from 'react';
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
  console.log("--- Komponen PublicPage Mulai Dirender ---");

  const firestore = useFirestore();
  const params = useParams();
  
  const pageId = typeof params?.pageId === 'string' ? params.pageId : null;
  console.log("1. ID Halaman dari URL (useParams):", pageId);

  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) {
      console.log("2. Referensi dokumen DILEWATI (firestore atau pageId belum siap).");
      return null;
    }
    console.log(`2. Referensi dokumen DIBUAT untuk: publishedPages/${pageId}`);
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  const { data: pageData, isLoading, error } = useDoc<PublicPageData>(pageDocRef);

  useEffect(() => {
    console.log("3. Status Hook useDoc:", { isLoading, hasData: !!pageData, error });
  }, [isLoading, pageData, error]);


  if (isLoading || !pageId) {
    console.log("4. Menampilkan status LOADING...");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error("5. TERJADI ERROR saat mengambil data:", error);
    return notFound();
  }
  
  if (!pageData) {
    console.warn("6. TIDAK ADA DATA DITEMUKAN setelah loading selesai. Ini menyebabkan 404.");
    return notFound();
  }
  
  console.log("7. DATA DITEMUKAN! Merender halaman...");
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