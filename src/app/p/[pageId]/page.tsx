
'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { PublishedPage } from '@/lib/types';


export default function PublicPage({ params }: { params: { pageId: string } }) {
  const firestore = useFirestore();
  const { pageId } = params;
  
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    // IMPORTANT: Fetch from the public 'publishedPages' collection
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

  // If there's an error OR if loading is done and there's still no data,
  // it means the page either doesn't exist or isn't published.
  if (error || !pageData) {
     if (error) console.error("Error loading public page:", error.message);
     notFound();
  }
  
  // No need to check pageData.published, as its existence in this collection
  // confirms it is public.

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

    