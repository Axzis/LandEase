'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useAuth, useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageCard } from '@/components/dashboard/page-card';
import { PageGridSkeleton } from '@/components/dashboard/page-grid-skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Logo } from '@/components/logo';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { createDefaultPageContent } from '@/lib/utils';
import { Loader2, LogOut, PlusCircle } from 'lucide-react';

interface Page {
  id: string;
  pageName: string;
  lastUpdated: any;
}

export function DashboardClient() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPages();
    }
  }, [user]);

  const fetchPages = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(collection(firestore, 'pages'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userPages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Page[];
      setPages(userPages);
    } catch (error) {
        // Since useCollection is not used here, we manually create and emit the error.
        const permissionError = new FirestorePermissionError({
            path: 'pages', // The query is on the 'pages' collection
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!user || !firestore) return;
    setIsCreatingPage(true);

    const pagesCollectionRef = collection(firestore, 'pages');
    const newPageData = {
      userId: user.uid,
      pageName: 'Untitled Page',
      content: createDefaultPageContent(),
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      published: false,
    };

    addDoc(pagesCollectionRef, newPageData)
      .then((docRef) => {
        toast({ title: "Page created!", description: "Redirecting to the editor..." });
        router.push(`/editor/${docRef.id}`);
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: pagesCollectionRef.path,
            operation: 'create',
            requestResourceData: newPageData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsCreatingPage(false);
      });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
      toast({ title: "Signed out successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to sign out." });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Pages</h1>
          <Button onClick={handleCreatePage} disabled={isCreatingPage}>
            {isCreatingPage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Create New Page
          </Button>
        </div>

        {isLoading ? (
          <PageGridSkeleton />
        ) : pages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pages.map(page => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        ) : (
          <EmptyState onCreatePage={handleCreatePage} />
        )}
      </main>
    </div>
  );
}
