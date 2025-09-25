'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import type { PageComponent } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface PageData {
  content: PageComponent[];
  pageName: string;
  pageBackgroundColor?: string;
  published: boolean;
}

export default function PublicPage() {
  const params = useParams();
  const pageId = params.pageId as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!pageId) {
      setIsLoading(false);
      setError("Page ID is missing.");
      return;
    }

    // Attempt to load from localStorage first for live preview
    try {
        const localPreviewData = localStorage.getItem(`preview_${pageId}`);
        if (localPreviewData) {
            const parsedData = JSON.parse(localPreviewData);
            setPageData(parsedData);
            setIsLoading(false);
            return; // Exit if we have local preview data
        }
    } catch(e) {
        console.warn("Could not parse preview data from localStorage", e);
    }


    const fetchPageData = async () => {
      try {
        const { firestore } = initializeFirebase();
        const pageRef = doc(firestore, 'pages', pageId);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
          const data = pageSnap.data() as PageData;
          if (data.published) {
            setPageData(data);
          } else {
            setError("This page is not published.");
          }
        } else {
          setError("Page not found.");
        }
      } catch (err: any) {
        console.error("Error fetching page data on client:", err);
        setError(err.message || "An error occurred while fetching the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className='ml-2'>Loading page...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Could Not Load Page</h1>
            <p className="text-muted-foreground mt-2">{error || "The requested page could not be found."}</p>
        </div>
      </div>
    );
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
