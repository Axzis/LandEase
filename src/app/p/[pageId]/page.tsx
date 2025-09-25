'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import type { PageComponent } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PageData {
  content: PageComponent[];
  pageName: string;
  pageBackgroundColor?: string;
  published?: boolean;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { firestore } = initializeFirebase();
        const pageRef = doc(firestore, 'pages', params.pageId);
        const pageSnap = await getDoc(pageRef);

        if (!pageSnap.exists()) {
          notFound();
          return;
        }
        
        const data = pageSnap.data() as PageData;

        if (data.published !== true) {
          notFound();
          return;
        }
        
        setPageData(data);
      } catch (error: any) {
        console.error("Error fetching published page:", error);
        
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `pages/${params.pageId}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        // For other errors or if we just want to treat permission errors as not found for the public
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [params.pageId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pageData) {
    // notFound() is called inside useEffect, but as a fallback
    return null; 
  }
  
  return (
    <div style={{ backgroundColor: pageData.pageBackgroundColor || '#FFFFFF' }}>
      <EditorCanvas
        content={pageData.content}
        readOnly
        pageId={params.pageId}
        pageName={pageData.pageName}
      />
    </div>
  );
}
