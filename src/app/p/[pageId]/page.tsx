
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import type { PageComponent } from '@/lib/types';
import { notFound } from 'next/navigation';

// This is now a React Server Component
// It fetches data directly on the server.

interface PageData {
  content: PageComponent[];
  pageName: string;
  pageBackgroundColor?: string;
  published?: boolean;
}

async function getPageData(pageId: string): Promise<PageData | null> {
    try {
        // We use a separate server-side initialization for Firebase
        const { firestore } = initializeFirebaseServer();
        const pageRef = doc(firestore, 'pages', pageId);
        const pageSnap = await getDoc(pageRef);

        if (!pageSnap.exists()) {
            return null;
        }
        
        return pageSnap.data() as PageData;

    } catch (error) {
        console.error("Error fetching published page on server:", error);
        // If there's any error fetching (including permissions if rules were to change),
        // treat it as not found.
        return null;
    }
}


export default async function PublicPage({ params }: { params: { pageId: string } }) {
  const pageData = await getPageData(params.pageId);

  // 1. Check if page data exists and if it's explicitly published
  if (!pageData || pageData.published !== true) {
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
