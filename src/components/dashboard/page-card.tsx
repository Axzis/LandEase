
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import Image from 'next/image';

interface PageCardProps {
  pageId: string;
  pageName: string;
}

export function PageCard({ pageId, pageName }: PageCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 group">
      <CardHeader>
        <CardTitle className="truncate">{pageName}</CardTitle>
        <CardDescription>
          ID: {pageId}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 aspect-video relative flex-grow overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${pageId}/400/225`}
          alt={`Preview of ${pageName}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="website landing-page"
        />
      </CardContent>
      <CardFooter className="p-4">
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
