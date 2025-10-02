'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { FileText, Users } from 'lucide-react';

interface PageAnalyticsProps {
  pageId: string;
}

export function PageAnalytics({ pageId }: PageAnalyticsProps) {
  const firestore = useFirestore();

  const submissionsQuery = useMemo(() => {
    if (!firestore || !pageId) return null;
    // We create a query to the subcollection for submissions
    return query(collection(firestore, `pages/${pageId}/submissions`));
  }, [firestore, pageId]);

  // We only care about the count, not the data itself.
  const { data: submissions, isLoading } = useCollection(submissionsQuery);

  const submissionCount = submissions?.length ?? 0;

  if (isLoading) {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24 rounded-md" />
        </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
      <div className="flex items-center">
        <FileText className="mr-1.5 h-4 w-4" />
        <span>{submissionCount} {submissionCount === 1 ? 'Submission' : 'Submissions'}</span>
      </div>
      {/* You could add a visitors count here in the future */}
      {/* <div className="flex items-center">
        <Users className="mr-1.5 h-4 w-4" />
        <span>0 Visitors</span>
      </div> */}
    </div>
  );
}
