'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { useMemo } from 'react';

interface Page {
  id: string;
  pageName: string;
  lastUpdated?: { toDate: () => Date };
}

interface PageCardProps {
  pageId: string;
}

export function PageCard({ pageId }: PageCardProps) {
  const firestore = useFirestore();
  
  const pageDocRef = useMemo(() => {
      if (!firestore || !pageId) return null;
      return doc(firestore, 'pages', pageId);
  }, [firestore, pageId]);

  const { data: page, isLoading, error } = useDoc<Page>(pageDocRef);

  if (isLoading) {
    return (
       <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent className="p-0 aspect-video flex-grow">
            <Skeleton className="h-full w-full" />
          </CardContent>
          <CardFooter className="p-4">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
    )
  }

  if (error || !page) {
    return (
       <Card className="flex flex-col overflow-hidden border-destructive/50">
          <CardHeader>
            <CardTitle className="truncate text-destructive">Error</CardTitle>
            <CardDescription>Could not load page data.</CardDescription>
          </CardHeader>
           <CardContent className="flex-grow p-4">
            <p className="text-xs text-destructive/80">{error?.message || 'Page not found.'}</p>
          </CardContent>
          <CardFooter className="p-4">
            <Button variant="ghost" disabled className="w-full">
              <Pencil className="mr-2 h-4 w-4" />
              Unavailable
            </Button>
          </CardFooter>
        </Card>
    );
  }

  const lastUpdatedString = page.lastUpdated
    ? formatDistanceToNow(page.lastUpdated.toDate(), { addSuffix: true })
    : 'N/A';

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 group">
      <CardHeader>
        <CardTitle className="truncate">{page.pageName}</CardTitle>
        <CardDescription>
          Last updated: {lastUpdatedString}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 aspect-video relative flex-grow overflow-hidden">
        <Image
          src="https://placehold.co/400x225.png"
          alt={`Preview of ${page.pageName}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="website landing-page"
        />
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full">
          <Link href={`/editor/${page.id}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Open Editor
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
