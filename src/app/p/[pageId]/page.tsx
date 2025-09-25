import { getDoc, doc, DocumentData } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { EditorCanvas } from '@/components/editor/editor-canvas';

// This page is now a Server Component to fetch data server-side.
// Revalidate set to 0 to ensure fresh data on each request.
export const revalidate = 0;

interface PageData extends DocumentData {
  content: any[];
  pageName: string;
  pageBackgroundColor?: string;
  published: boolean;
}

async function getPageData(pageId: string): Promise<PageData | null> {
  try {
    const { firestore } = initializeFirebaseServer();
    const pageDocRef = doc(firestore, 'pages', pageId);
    const pageSnap = await getDoc(pageDocRef);

    if (!pageSnap.exists()) {
      return null;
    }

    const data = pageSnap.data() as PageData;
    // Server-side check for published status
    if (!data.published) {
        return null;
    }

    return data;

  } catch (error) {
    console.error("Error fetching public page data:", error);
    // If there's any error (including permissions), treat as not found.
    return null;
  }
}

export default async function PublicPage({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
  const pageData = await getPageData(pageId);

  // If pageData is null (not found, not published, or error fetching),
  // render the not-found page.
  if (!pageData) {
    notFound();
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
