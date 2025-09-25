
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';

// Admin SDK for server-side fetches.
// IMPORTANT: This uses the Admin SDK, which bypasses security rules.
// We must manually enforce the 'published' flag.
const getAdminApp = () => {
  const apps = getAdminApps();
  if (apps.length > 0) {
    return apps[0];
  }

  // Next.js caches the result of this function, so it's safe to call it.
  // The service account JSON is retrieved from environment variables.
  const serviceAccount = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string
  );

  return initializeAdminApp({
    credential: {
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
      projectId: serviceAccount.project_id,
    }
  });
};

export default async function PublicPage({ params }: { params: { pageId: string } }) {
  const adminApp = getAdminApp();
  const firestore = getAdminFirestore(adminApp);
  
  const pageRef = doc(firestore, 'pages', params.pageId);
  const pageSnap = await getDoc(pageRef);

  if (!pageSnap.exists()) {
    notFound();
  }

  const pageData = pageSnap.data();

  // CRITICAL: Manually enforce that only 'published' pages can be viewed.
  if (pageData.published !== true) {
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
