'use client';
import { useState, useCallback } from 'react';
import { useUser, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { PageCard } from './page-card';
import { CreatePageDialog } from './create-page-dialog';
import { EmptyState } from './empty-state';
import { PageGridSkeleton } from './page-grid-skeleton';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Page } from '@/lib/types';

export function DashboardClient() {
  const { user, loading: userLoading } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pagesQuery = user ? query(collection(db, 'pages'), where('userId', '==', user.uid)) : null;
  const { data: pages, isLoading: pagesLoading, error } = useCollection<Page>(pagesQuery);

  const handlePageDelete = useCallback(async (pageId: string) => {
    // Logika hapus halaman (jika diperlukan)
    // Contoh: await deleteDoc(doc(db, 'pages', pageId));
    // Untuk saat ini kita refresh saja
  }, []);

  const openDialog = useCallback(() => setIsDialogOpen(true), []);
  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  if (userLoading || (pagesLoading && user)) {
    return <PageGridSkeleton />;
  }

  if (error) {
    return <p className="text-destructive text-center">Error: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Pages</h1>
        <Button onClick={openDialog}>
          <Plus className="mr-2 h-4 w-4" /> Create Page
        </Button>
      </div>

      {pages && pages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} onPageDelete={handlePageDelete} />
          ))}
        </div>
      ) : (
        <EmptyState onOpenDialog={openDialog} />
      )}

      <CreatePageDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}