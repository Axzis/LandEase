'use client';

import React, { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation'; // <-- 1. Tambahkan impor useParams
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

// 2. Hapus props 'params' dari sini
export default function PublicPage() { 
  const firestore = useFirestore();
  
  // 🔥 PERBAIKAN UTAMA: Gunakan hook useParams() untuk mendapatkan ID halaman
  const params = useParams();
  const pageId = typeof params.pageId === 'string' ? params.pageId : null;
  
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    
    // Ini sudah benar, mengarah ke koleksi 'publishedPages'
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  const { data: pageData, isLoading, error } = useDoc<PublicPageData>(pageDocRef);

  // Tampilkan loading spinner saat data diambil atau pageId belum siap
  if (isLoading || !pageId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika ada error atau data tidak ditemukan, tampilkan 404
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