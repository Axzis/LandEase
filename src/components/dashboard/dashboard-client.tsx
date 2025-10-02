
'use client';

import { useState, useMemo } from 'react';
import { collection, doc, serverTimestamp, writeBatch, arrayUnion, getDoc, runTransaction } from 'firebase/firestore';
import { useFirestore, useUser, useDoc, errorEmitter, FirestorePermissionError, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageCard } from '@/components/dashboard/page-card';
import { PageGridSkeleton } from '@/components/dashboard/page-grid-skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Logo } from '@/components/logo';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { createDefaultPageContent } from '@/lib/utils';
import { Loader2, LogOut, PlusCircle, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { CreatePageDialog } from './create-page-dialog';

interface UserPageLink {
  pageId: string;
  pageName: string;
  thumbnailUrl?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get the user document which contains the list of pages
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);

  const { data: userData, isLoading, error } = useDoc<UserData>(userDocRef);

  const filteredPages = useMemo(() => {
    if (!userData?.pages) return [];
    return userData.pages.filter(page =>
      page.pageName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userData, searchTerm]);

  const handleCreatePage = async (pageName: string) => {
    if (!user || !firestore) return;
    setIsCreatingPage(true);

    try {
        const batch = writeBatch(firestore);

        // 1. Create the new page document in the 'pages' collection
        const newPageRef = doc(collection(firestore, 'pages'));
        const newPageData = {
          userId: user.uid,
          pageName: pageName,
          content: createDefaultPageContent(),
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          published: false,
          thumbnailUrl: `https://picsum.photos/seed/${newPageRef.id}/400/225`
        };
        batch.set(newPageRef, newPageData);

        // 2. Add a reference to this new page in the user's document
        const userRef = doc(firestore, `users/${user.uid}`);
        batch.update(userRef, {
            pages: arrayUnion({ pageId: newPageRef.id, pageName: pageName, thumbnailUrl: newPageData.thumbnailUrl })
        });
        
        await batch.commit();

        toast({ title: "Page created!", description: "Redirecting to the editor..." });
        router.push(`/editor/${newPageRef.id}`);
    } catch(e: any) {
        console.error("Error creating page", e);
        if (e.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `pages/<new_page>`, 
                operation: 'write',
                requestResourceData: { pageName }
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create a new page. Please check permissions and try again.'});
        }
    } finally {
        setIsCreatingPage(false);
        setIsDialogOpen(false);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Your Pages</h1>
          <CreatePageDialog 
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            onCreatePage={handleCreatePage} 
            isCreating={isCreatingPage}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Page
            </Button>
          </CreatePageDialog>
        </div>
        
        <div className="mb-8">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                />
            </div>
        </div>


        {isLoading ? (
          <PageGridSkeleton />
        ) : error ? (
           <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg border-destructive/50 bg-destructive/10">
              <h2 className="text-2xl font-semibold text-destructive-foreground">Error Loading Pages</h2>
              <p className="mt-2 text-destructive-foreground/80">Could not load your data: {error.message}</p>
            </div>
        ) : userData && userData.pages && userData.pages.length > 0 ? (
           filteredPages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPages.map(page => (
                    <PageCard key={page.pageId} pageId={page.pageId} pageName={page.pageName} thumbnailUrl={page.thumbnailUrl} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold text-foreground">No pages found</h2>
                    <p className="mt-2 text-muted-foreground">Your search for "{searchTerm}" did not match any pages.</p>
                </div>
            )
        ) : (
          <EmptyState onTriggerCreate={() => setIsDialogOpen(true)} />
        )}
      </main>
    </div>
  );
}
