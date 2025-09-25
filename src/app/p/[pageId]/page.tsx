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

  // If there's an error (like permission-denied), show not found.
  if (error) {
     console.error("Error loading page:", error);
     // This is critical. A permission error from useDoc needs to result in a 404.
     notFound();
  }

  // If data is null after loading and there's no error, it means the document doesn't exist.
  if (!pageData) {
    notFound();
  }

  // CRITICAL: Manually enforce that only 'published' pages can be viewed.
  // This adds a layer of client-side security, complementing the Firestore rules.
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
