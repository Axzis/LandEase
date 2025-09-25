
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { notFound } from 'next/navigation';
import { getPublishedPage } from '@/lib/published-pages-server';

// This is now a React Server Component that reads from a static JSON file.
// It completely avoids Firestore to bypass permission issues.

export default async function PublicPage({ params }: { params: { pageId: string } }) {
  // We fetch page data from a static JSON file, not from Firebase.
  const pageData = await getPublishedPage(params.pageId);

  // The 'published' check is implicit. If it's in the static file, it's considered published.
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
