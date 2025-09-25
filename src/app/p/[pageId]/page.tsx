
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { notFound } from 'next/navigation';
import { getPublishedPage } from '@/lib/published-pages-server';

// Ini adalah React Server Component yang membaca dari file JSON statis.
// Ini sepenuhnya menghindari Firestore untuk melewati masalah izin.

export default async function PublicPage({ params }: { params: { pageId: string } }) {
  // Kami mengambil data halaman dari file JSON statis, bukan dari Firebase.
  const pageData = await getPublishedPage(params.pageId);

  // Pemeriksaan 'published' bersifat implisit. Jika ada di file statis, itu dianggap dipublikasikan.
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
