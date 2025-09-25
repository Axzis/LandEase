'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import type { PageComponent } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface PageData {
  content: PageComponent[];
  pageName: string;
  pageBackgroundColor?: string;
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

    // This component now ONLY loads from localStorage for live preview purposes.
    // It does not fetch from Firestore to avoid permission issues for public viewers under strict auth rules.
    try {
        const localPreviewData = localStorage.getItem(`preview_${pageId}`);
        if (localPreviewData) {
            const parsedData = JSON.parse(localPreviewData);
            setPageData(parsedData);
        } else {
             setError("This page is not available for preview. Please save it in the editor first to generate a preview.");
        }
    } catch(e) {
        console.error("Could not parse preview data from localStorage", e);
        setError("An error occurred while loading the preview data.");
    } finally {
        setIsLoading(false);
    }
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className='ml-2'>Loading Preview...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Could Not Load Preview</h1>
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
