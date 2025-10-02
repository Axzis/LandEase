
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import { PageAnalytics } from './page-analytics';

interface PageCardProps {
  pageId: string;
  pageName: string;
  thumbnailUrl?: string;
}

export function PageCard({ pageId, pageName, thumbnailUrl }: PageCardProps) {
  const imageSrc = thumbnailUrl || `https://picsum.photos/seed/${pageId}/400/225`;
    
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 group">
      <CardHeader>
        <CardTitle className="truncate">{pageName}</CardTitle>
        <CardDescription>
          ID: {pageId}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="px-4 pb-4">
          <PageAnalytics pageId={pageId} />
        </div>
        <div className="aspect-video relative flex-grow overflow-hidden">
          <Image
            src={imageSrc}
            alt={`Preview of ${pageName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="website landing-page"
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button asChild className="w-full">
          <Link href={`/editor/${pageId}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Open Editor
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
