import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Pencil } from 'lucide-react';
import Image from 'next/image';

interface Page {
  id: string;
  pageName: string;
  lastUpdated?: { toDate: () => Date };
}

interface PageCardProps {
  page: Page;
}

export function PageCard({ page }: PageCardProps) {
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
