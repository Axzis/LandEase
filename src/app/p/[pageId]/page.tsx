
import { EditorCanvas } from "@/components/editor/editor-canvas";
import { initializeFirebaseServer } from "@/firebase/server-init";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";

// Revalidate the page every 60 seconds
export const revalidate = 60;

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

        // Security check: Only show published pages
        if (!data.published) {
             return (
                <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold">404</h1>
                        <p className="text-lg text-muted-foreground">Page not found or is not public.</p>
                    </div>
                </div>
            )
        }
        pageData = data;

    } catch (error) {
        console.error("Error fetching public page:", error);
         return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Error</h1>
                    <p className="text-lg text-muted-foreground">Could not load page. There might be a permission issue.</p>
                </div>
            </div>
        )
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
