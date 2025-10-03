import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Pastikan path ini benar
import { PageContent } from '@/lib/types';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { notFound } from 'next/navigation';

interface PublicPageProps {
  params: {
    pageId: string;
  };
}

async function getPublishedPage(pageId: string) {
  const docRef = doc(db, 'publishedPages', pageId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  return docSnap.data();
}

export default async function PublicPage({ params }: PublicPageProps) {
  const pageData = await getPublishedPage(params.pageId);

  if (!pageData) {
    notFound();
  }

  const content = pageData.content as PageContent || [];
  const pageBackgroundColor = pageData.pageBackgroundColor as string || '#FFFFFF';

  return (
    <div style={{ backgroundColor: pageBackgroundColor }}>
      <EditorCanvas content={content} isPublicView />
    </div>
  );
}