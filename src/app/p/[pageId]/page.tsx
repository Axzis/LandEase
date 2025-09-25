
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { initializeFirebaseServer } from "@/firebase/server-init";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";

// Force dynamic rendering and disable all caching to ensure fresh data and rules are used.
export const revalidate = 0;

export default async function PublicPage({ params }: { params: { pageId: string } }) {
    const { firestore } = initializeFirebaseServer();
    const { pageId } = params;

    if (!pageId) {
        notFound();
    }

    const pageDocRef = doc(firestore, "pages", pageId);
    let pageData;

    try {
        const pageSnap = await getDoc(pageDocRef);

        if (!pageSnap.exists()) {
            notFound();
        }
        
        const data = pageSnap.data();

        // Security check: Only show published pages.
        // If the page isn't published, treat it as not found.
        if (!data.published) {
            notFound();
        }
        pageData = data;

    } catch (error) {
        console.error("Error fetching public page, treating as not found:", error);
        // If any error occurs during fetch (including permissions), treat the page as not found.
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
    )
}
