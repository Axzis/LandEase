'use client';

import { EditorCanvas } from '@/components/editor/editor-canvas';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface PageData {
    content: any[];
    pageBackgroundColor: string;
    pageName: string;
    published: boolean;
    userId: string;
}

export default function PublicPage({ params }: { params: Promise<{ pageId: string }> }) {
  const firestore = useFirestore();
  // Next.js now provides params as a promise in client components.
  // We must use `React.use` to unwrap it.
  const resolvedParams = React.use(params);
  const { pageId } = resolvedParams;
  
  const pageDocRef = useMemoFirebase(() => {
    if (!firestore || !pageId) return null;
    return doc(firestore, 'pages', pageId);
  }, [firestore, pageId]);

  const { data: pageData, isLoading, error } = useDoc<PageData>(pageDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     console.error("Error loading page:", error);
     // Ini bisa jadi error izin atau dokumen tidak ada.
     // notFound() adalah default yang masuk akal.
     notFound();
  }

  // Jika data null setelah memuat dan tidak ada error, itu berarti dokumen tidak ada.
  if (!pageData) {
    notFound();
  }

  // KRITIS: Secara manual menegakkan bahwa hanya halaman yang 'published' yang dapat dilihat.
  // Ini menambahkan lapisan keamanan di klien, melengkapi aturan Firestore.
  if (pageData.published !== true) {
    notFound();
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
