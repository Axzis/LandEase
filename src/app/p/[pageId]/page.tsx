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

export default function PublicPage({ params }: { params: Promise<{ pageId: string }> }) {
  const firestore = useFirestore();

  // Next.js now provides params as a promise in client components.
  // We must use `React.use` to unwrap it. This is the correct modern approach.
  const resolvedParams = React.use(params);
  const { pageId } = resolvedParams;
  
  // Memoize the document reference to prevent re-renders.
  // This is stable and depends only on firestore and pageId.
  const pageDocRef = useMemo(() => {
    if (!firestore || !pageId) return null;
    return doc(firestore, 'pages', pageId);
  }, [firestore, pageId]);

  // The useDoc hook handles the real-time subscription.
  const { data: pageData, isLoading, error } = useDoc<PageData>(pageDocRef);

  // 1. Show a loading state while data is being fetched.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. If an error occurs (e.g., permission-denied), show a 404 page.
  // This is a critical step for security.
  if (error) {
     console.error("Error loading page:", error);
     notFound();
  }

  // 3. If loading is finished and there's still no data, the document doesn't exist.
  if (!pageData) {
    notFound();
  }

  // 4. CRITICAL: After confirming data exists, check if it's published.
  // This prevents showing unpublished content.
  if (pageData.published !== true) {
    notFound();
  }
  
  // 5. If all checks pass, render the page.
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
