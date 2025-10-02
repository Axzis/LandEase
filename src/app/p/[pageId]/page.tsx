'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { EditorCanvas } from '@/components/editor/editor-canvas';

// Define a clear type for the expected page data
interface PageData {
  content: any[];
  pageBackgroundColor: string;
  pageName: string;
  published: boolean;
  userId: string;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const firestore = useFirestore();
  // Correctly unwrap the params promise using React.use()
  const resolvedParams = React.use(params);
  const { pageId } = resolvedParams;
  
  // Memoize the document reference to prevent re-renders.
  // This points back to the primary 'pages' collection.
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    return doc(firestore, 'pages', pageId);
  }, [firestore, pageId]);

  // The useDoc hook will attempt to fetch the document.
  // Security rules will determine if it succeeds.
  const { data: pageData, isLoading, error } = useDoc<PageData>(pageDocRef);

  // 1. Show a loading state while the request is in flight.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. If an error occurred OR if loading is done and there's still no data,
  // it means the doc doesn't exist or we don't have permission to read it
  // (because it's not published). In either case, show a 404.
  if (error || !pageData) {
     if (error) console.error("Error loading page:", error.message);
     notFound();
  }
  
  // 3. We can be certain pageData exists here.
  // As a final client-side check, ensure the published flag is explicitly true.
  // While the security rule is the primary enforcer, this adds a layer of defense.
  if (pageData.published !== true) {
    notFound();
  }

  // 4. If all checks pass, render the page.
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
