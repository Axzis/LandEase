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
  
  const resolvedParams = use(params);
  const { pageId } = resolvedParams;
  
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    
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

  if (error || !pageData) {
     if (error) console.error("Error loading public page:", error.message);
     notFound();
  }
  
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
