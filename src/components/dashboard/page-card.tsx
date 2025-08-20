import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Pencil } from 'lucide-react';
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
    <Card className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
           <FileText className="h-8 w-8 text-primary" />
        </div>
         <CardTitle className="mt-4 truncate">{page.pageName}</CardTitle>
        <CardDescription>
          Last updated: {lastUpdatedString}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button asChild className="w-full">
          <Link href={`/editor/${page.id}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Open Editor
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
