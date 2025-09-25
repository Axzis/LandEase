'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { notFound, useParams } from 'next/navigation';
import { initializeFirebase } from '@/firebase/server-init'; // Can be used on client too
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';

export default function PublicPage() {
    const params = useParams();
    const pageId = params.pageId as string;
    
    const [pageData, setPageData] = useState<DocumentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pageId) {
            setIsLoading(false);
            setError("Halaman tidak ditemukan.");
            return;
        }

        const fetchPage = async () => {
            try {
                // We can use server-init here as it just initializes the app, which is fine on client.
                const { firestore } = initializeFirebase();
                const pageDocRef = doc(firestore, "pages", pageId);
                const pageSnap = await getDoc(pageDocRef);

                if (!pageSnap.exists()) {
                    setError("Halaman tidak ditemukan.");
                } else {
                    const data = pageSnap.data();
                    // Security check: Only show published pages.
                    if (!data.published) {
                        setError("Halaman ini tidak dipublikasikan.");
                    } else {
                        setPageData(data);
                    }
                }
            } catch (err: any) {
                console.error("Error fetching public page:", err);
                // Even with open rules, if an error occurs, treat as not found.
                setError("Gagal memuat halaman.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPage();
    }, [pageId]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Memuat halaman...</p>
            </div>
        );
    }

    if (error || !pageData) {
        // Using Next.js notFound() will render the not-found.js file.
        // It's better to show a clear message here in case not-found.js is not configured.
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <p className="text-destructive font-semibold">{error || "Halaman tidak dapat dimuat."}</p>
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
    );
}
