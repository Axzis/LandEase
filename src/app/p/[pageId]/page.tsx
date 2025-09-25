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
     // This could be a permissions error or the document not existing.
     // notFound() is a reasonable default.
     notFound();
  }

  // If data is null after loading and no error, it means the doc doesn't exist.
  if (!pageData) {
    notFound();
  }

  // CRITICAL: Manually enforce that only 'published' pages can be viewed.
  if (pageData.published !== true) {
    // You could show a specific "not published" page or just a 404.
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
