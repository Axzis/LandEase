'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageCard } from '@/components/dashboard/page-card';
import { PageGridSkeleton } from '@/components/dashboard/page-grid-skeleton';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Logo } from '@/components/logo';
import { User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { createDefaultPageContent } from '@/lib/utils';
import { Loader2, LogOut, PlusCircle } from 'lucide-react';

interface Page {
  id: string;
  pageName: string;
  lastUpdated: any;
}

export function DashboardClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
      const q = query(collection(db, 'pages'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userPages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Page[];
      setPages(userPages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch your pages." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!user) return;
    setIsCreatingPage(true);
    try {
      const newPageRef = await addDoc(collection(db, 'pages'), {
        userId: user.uid,
        pageName: 'Untitled Page',
        content: createDefaultPageContent(),
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      toast({ title: "Page created!", description: "Redirecting to the editor..." });
      router.push(`/editor/${newPageRef.id}`);
    } catch (error) {
      console.error("Error creating page: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not create a new page." });
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
