import { Button } from '@/components/ui/button';
import { FilePlus2, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onTriggerCreate: () => void;
}

export function EmptyState({ onTriggerCreate }: EmptyStateProps) {
  return (
    <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
      <div className="flex justify-center mb-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-foreground">You haven't created any pages yet.</h2>
      <p className="mt-2 text-muted-foreground">Let's change that! Get started by creating your first landing page.</p>
      <Button onClick={onTriggerCreate} className="mt-6">
        <FilePlus2 className="mr-2 h-4 w-4" />
        Create Your First Page
      </Button>
    </div>
  );
}
