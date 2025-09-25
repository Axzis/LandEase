import { ProtectedRoute } from "@/components/auth/protected-route";
import { EditorClient } from "@/components/editor/editor-client";
import { initializeFirebaseServer } from "@/firebase/server-init";
import { doc, getDoc } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";

async function getPageData(pageId: string) {
  const { firestore } = initializeFirebaseServer();
  const pageDocRef = doc(firestore, "pages", pageId);

  try {
    const pageDoc = await getDoc(pageDocRef);
    if (pageDoc.exists()) {
      return { id: pageDoc.id, ...pageDoc.data() };
    }
    return null;
  } catch (error: any) {
    // Check if the error is a permission error.
    if (error.code === 'permission-denied') {
        // Construct and throw the detailed, contextual error for the dev overlay.
        const permissionError = new FirestorePermissionError({
            path: pageDocRef.path,
            operation: 'get',
        });
        throw permissionError;
    }
    // Re-throw other types of errors.
    throw error;
  }
}

export default async function EditorPage({ params }: { params: { pageId: string } }) {
  const pageData = await getPageData(params.pageId);

  if (!pageData) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen w-full items-center justify-center">
                <p>Page not found or you do not have permission to view it.</p>
            </div>
        </ProtectedRoute>
    )
  }

  // Ensure pageData is serializable for the client component
  const serializablePageData = {
    ...pageData,
    createdAt: pageData.createdAt?.toDate()?.toISOString() || null,
    lastUpdated: pageData.lastUpdated?.toDate()?.toISOString() || null,
  };


  return (
    <ProtectedRoute>
      <EditorClient pageData={JSON.parse(JSON.stringify(serializablePageData))} />
    </ProtectedRoute>
  );
}
