import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { initializeFirebaseServer } from '@/firebase/server-init';
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';
import { cache } from 'react';

// Using cache to prevent re-fetching data for the same page within a single request
const getPage = cache(async (pageId: string) => {
    try {
        const { firestore } = initializeFirebaseServer();
        const pageDocRef = doc(firestore, "pages", pageId);
        const pageSnap = await getDoc(pageDocRef);

        if (!pageSnap.exists()) {
            return null;
        }

        const data = pageSnap.data();
        // Security check: Only return published pages
        if (!data.published) {
            return null;
        }
        return data;
    } catch (err) {
        console.error("Error fetching public page:", err);
        // If any error occurs (including permission errors), treat as not found
        return null;
    }
});


export default async function PublicPage({ params }: { params: { pageId: string } }) {
    const pageId = params.pageId;
    
    if (!pageId) {
        notFound();
    }

    const pageData = await getPage(pageId);

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
