import { ProtectedRoute } from "@/components/auth/protected-route";
import { EditorClient } from "@/components/editor/editor-client";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

async function getPageData(pageId: string) {
  try {
    const pageDoc = await getDoc(doc(db, "pages", pageId));
    if (pageDoc.exists()) {
      return { id: pageDoc.id, ...pageDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

export default async function EditorPage({ params }: { params: { pageId: string } }) {
  const pageData = await getPageData(params.pageId);

  if (!pageData) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen w-full items-center justify-center">
                <p>Page not found or an error occurred.</p>
            </div>
        </ProtectedRoute>
    )
  }

  // Ensure pageData is serializable for the client component
  const serializablePageData = {
    ...pageData,
    createdAt: pageData.createdAt?.toDate()?.toISOString() || null,
    lastUpdated: pageData.lastUpdated?.toDate()?.toISOString() || null,
    // Pass the project ID to the client
    projectId: firebaseConfig.projectId,
  };


  return (
    <ProtectedRoute>
      <EditorClient pageData={JSON.parse(JSON.stringify(serializablePageData))} />
    </ProtectedRoute>
  );
}
