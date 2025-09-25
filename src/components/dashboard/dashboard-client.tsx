'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
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

  const [isCreatingPage, setIsCreatingPage] = useState(false);

  const pagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'pages'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: pages, isLoading, error } = useCollection<Page>(pagesQuery);

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

    try {
        const docRef = await addDoc(pagesCollectionRef, newPageData);
        toast({ title: "Page created!", description: "Redirecting to the editor..." });
        router.push(`/editor/${docRef.id}`);
    } catch(e) {
        console.error("Error creating page", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create a new page. Please check permissions and try again.'});
    } finally {
        setIsCreatingPage(false);
    }
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
        ) : error ? (
           <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg border-destructive/50 bg-destructive/10">
              <h2 className="text-2xl font-semibold text-destructive-foreground">Error Loading Pages</h2>
              <p className="mt-2 text-destructive-foreground/80">Could not load your pages due to an error: {error.message}</p>
            </div>
        ) : pages && pages.length > 0 ? (
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
