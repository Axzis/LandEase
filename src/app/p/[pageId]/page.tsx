'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { initializeFirebase } from '@/firebase'; // Menggunakan inisialisasi sisi klien
import { EditorCanvas } from '@/components/editor/editor-canvas';
import { Loader2 } from 'lucide-react';

// Tipe untuk data halaman
interface PageData extends DocumentData {
  content: any[];
  pageName: string;
  pageBackgroundColor?: string;
  published: boolean;
}

export default function PublicPage({ params }: { params: { pageId: string } }) {
    const { pageId } = params;
    const [pageData, setPageData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pageId) {
            setError("Page ID is missing.");
            setLoading(false);
            return;
        }

        const fetchPage = async () => {
            try {
                // Inisialisasi Firebase di sisi klien
                const { firestore } = initializeFirebase();
                const pageDocRef = doc(firestore, "pages", pageId);
                const pageSnap = await getDoc(pageDocRef);

                if (!pageSnap.exists()) {
                    setError("Halaman tidak ditemukan.");
                } else {
                    const data = pageSnap.data() as PageData;
                    // Pemeriksaan keamanan di sisi klien: hanya tampilkan jika dipublikasikan
                    if (data.published) {
                        setPageData(data);
                    } else {
                        setError("Halaman ini tidak dipublikasikan.");
                    }
                }
            } catch (err) {
                console.error("Error fetching public page:", err);
                setError("Gagal memuat halaman.");
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [pageId]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Memuat halaman...</p>
            </div>
        );
    }

    if (error || !pageData) {
        // Menggunakan notFound() akan me-render halaman 404 Next.js
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
