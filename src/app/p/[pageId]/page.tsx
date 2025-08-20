import { PublicPageRenderer } from "@/components/public/public-page-renderer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Metadata } from 'next'

async function getPageData(pageId: string) {
  try {
    const pageDoc = await getDoc(doc(db, "pages", pageId));
    if (pageDoc.exists()) {
      const data = pageDoc.data();
      // Only return data if the page is published
      if (data.published) {
        return { id: pageDoc.id, ...data };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { pageId: string } }): Promise<Metadata> {
  const pageData = await getPageData(params.pageId);
 
  if (!pageData) {
    return {
      title: 'Page Not Found',
    }
  }
 
  return {
    title: pageData.pageName || 'Untitled Page',
    // You can add more metadata here like description, open graph images, etc.
    description: `A page created with LandEase.`,
  }
}

export default async function PublicPage({ params }: { params: { pageId:string } }) {
    const pageData = await getPageData(params.pageId);

    if (!pageData) {
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
        <PublicPageRenderer content={pageData.content} />
    )
}
