'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';

// Define a clear type for the expected page data
interface PublicPageData {
  content: any[];
  pageBackgroundColor: string;
  pageName: string;
}

export default function PublicPage({ params }: { params: Promise<{ pageId: string }> }) {
  const firestore = useFirestore();
  const resolvedParams = React.use(params);
  const { pageId } = resolvedParams;
  
  // This now points to the public, read-only collection.
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    return doc(firestore, 'publishedPages', pageId);
  }, [firestore, pageId]);

  // The useDoc hook handles the real-time subscription.
  // It will correctly return `data: null` and `error: null` if the doc doesn't exist.
  const { data: pageData, isLoading, error } = useDoc<PublicPageData>(pageDocRef);

  // 1. Show a loading state while data is being fetched.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. If an error occurs (e.g., something other than not found), show a 404.
  // This is a safety net. For this collection, permission errors shouldn't happen.
  if (error) {
     console.error("Error loading published page:", error);
     notFound();
  }

  // 3. If loading is finished and there's no data, the document doesn't exist in the
  // 'publishedPages' collection, which means it's not published or doesn't exist.
  // This is the primary mechanism for showing a 404.
  if (!pageData) {
    notFound();
  }
  
  // 4. If all checks pass, render the page. No need to check for a `published` flag
  // because the document's existence in this collection confirms it.
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
