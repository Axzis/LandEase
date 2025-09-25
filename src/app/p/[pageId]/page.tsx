import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import type { PageComponent } from '@/lib/types';
import { notFound } from 'next/navigation';

interface PageData {
  content: PageComponent[];
  pageName: string;
  pageBackgroundColor?: string;
  published?: boolean;
}

async function getPageData(pageId: string): Promise<PageData | null> {
  try {
    const { firestore } = initializeFirebaseServer();
    const pageRef = doc(firestore, 'pages', pageId);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      return null;
    }
    
    const pageData = pageSnap.data() as PageData;

    // Pastikan halaman telah dipublikasikan sebelum menampilkannya
    if (pageData.published !== true) {
      return null;
    }
    
    return pageData;

  } catch (error) {
    console.error("Error fetching published page:", error);
    // Jika ada error (termasuk error izin untuk halaman yang tidak dipublikasikan), anggap saja tidak ditemukan.
    return null;
  }
}

export default async function PublicPage({ params }: { params: { pageId: string } }) {
  const pageData = await getPageData(params.pageId);

  if (!pageData) {
    // Fungsi notFound() dari Next.js akan menampilkan halaman 404 standar.
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
