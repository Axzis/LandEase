'use client';

import { useState, useMemo } from 'react';
import { collection, doc, addDoc, serverTimestamp, writeBatch, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth, useFirestore, useUser, useDoc } from '@/firebase';
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

interface UserPageLink {
  pageId: string;
  pageName: string;
}

interface UserData {
    pages: UserPageLink[];
}

export function DashboardClient() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Get the user document which contains the list of pages
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);

  const { data: userData, isLoading, error } = useDoc<UserData>(userDocRef);

  const handleCreatePage = async () => {
    if (!user || !firestore) return;
    setIsCreatingPage(true);

    try {
        const batch = writeBatch(firestore);
        const pageName = 'Untitled Page';

        // 1. Create the new page document in the 'pages' collection
        const newPageRef = doc(collection(firestore, 'pages'));
        const newPageData = {
          userId: user.uid,
          pageName: pageName,
          content: createDefaultPageContent(),
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          published: false,
        };
        batch.set(newPageRef, newPageData);

        // 2. Add a reference to this new page in the user's document
        const userRef = doc(firestore, `users/${user.uid}`);
        batch.update(userRef, {
            pages: arrayUnion({ pageId: newPageRef.id, pageName: pageName })
        });
        
        await batch.commit();

        toast({ title: "Page created!", description: "Redirecting to the editor..." });
        router.push(`/editor/${newPageRef.id}`);
    } catch(e) {
        console.error("Error creating page", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create a new page. Please check permissions and try again.'});
    } finally {
        setIsCreatingPage(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if(auth) {
        await signOut(auth);
        router.push('/signin');
        toast({ title: "Signed out successfully." });
      }
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
              <p className="mt-2 text-destructive-foreground/80">Could not load your data: {error.message}</p>
            </div>
        ) : userData && userData.pages && userData.pages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userData.pages.map(page => (
              <PageCard key={page.pageId} pageId={page.pageId} pageName={page.pageName} />
            ))}
          </div>
        ) : (
          <EmptyState onCreatePage={handleCreatePage} />
        )}
      </main>
    </div>
  );
}
