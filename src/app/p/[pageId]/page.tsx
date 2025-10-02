'use client';

import React, { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
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

export default function PublicPage() {
  const firestore = useFirestore();
  const params = useParams();
  
  // Cara paling aman untuk mendapatkan ID halaman dari URL
  const pageId = typeof params?.pageId === 'string' ? params.pageId : null;

  // --- LANGKAH DEBUGGING ---
  // Pesan ini akan muncul di konsol browser Anda (tekan F12)
  console.log("Mencoba memuat halaman dengan ID:", pageId);

  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) {
      console.log("Referensi dokumen tidak bisa dibuat: firestore atau pageId tidak ada.");
      return null;
    }
    console.log(`Membuat referensi dokumen: publishedPages/${pageId}`);
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  const { data: pageData, isLoading, error } = useDoc<PublicPageData>(pageDocRef);

  // Tangani jika ada error dari hook Firebase
  if (error) {
    console.error("Error dari hook Firebase:", error);
    return notFound();
  }

  // Tampilkan loading jika ID belum siap atau Firebase sedang mengambil data
  if (isLoading || !pageDocRef) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat Halaman...</p>
      </div>
    );
  }

  // Tampilkan 404 jika loading selesai tapi tidak ada data
  if (!pageData) {
    console.warn(`Dokumen tidak ditemukan untuk ID: ${pageId}. Ini yang menyebabkan 404.`);
    return notFound();
  }
  
  // Tampilkan halaman jika data berhasil didapatkan
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