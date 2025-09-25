import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import type { PageComponent } from '@/lib/types';

// Force dynamic rendering and prevent caching
export const revalidate = 0;

interface PageData {
  content: PageComponent[];
  pageName: string;
  pageBackgroundColor?: string;
  published: boolean;
}

async function getPageData(pageId: string): Promise<PageData | null> {
  // Initialize server-side admin access
  const { firestore } = initializeFirebaseServer();
  const pageRef = doc(firestore, 'pages', pageId);
  
  try {
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      return null;
    }

    const data = pageSnap.data() as PageData;
    
    // Enforce publishing rule at the application level as a safeguard
    if (!data.published) {
        return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching page data on server:", error);
    // In case of any error (including permissions), treat as not found
    return null;
  }
}

export default async function PublicPage({ params }: { params: { pageId: string } }) {
  const pageData = await getPageData(params.pageId);

  // If page doesn't exist or is not published, show a 404 page
  if (!pageData) {
    notFound();
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
