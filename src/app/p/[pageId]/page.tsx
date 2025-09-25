'use client';

import { EditorCanvas } from "@/components/editor/editor-canvas";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PublicPage() {
    const pathname = usePathname();
    const pageId = pathname.split('/').pop() || '';
    
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const pageDocRef = useMemoFirebase(() => {
        if (!firestore || !pageId) return null;
        return doc(firestore, "pages", pageId);
    }, [firestore, pageId]);

    const { data: pageData, isLoading: pageLoading, error } = useDoc(pageDocRef);

    if (userLoading || pageLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Error</h1>
                    <p className="text-lg text-muted-foreground">Could not load page. You may not have permission.</p>
                </div>
            </div>
        )
    }

    if (!pageData || !pageData.published) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-lg text-muted-foreground">Page not found or is not public.</p>
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
