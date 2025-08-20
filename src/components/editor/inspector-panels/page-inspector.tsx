import { Settings } from 'lucide-react';
import { BaseInspector } from './base-inspector';

export function PageInspector() {
  return (
    <BaseInspector title="Page Settings">
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <Settings className="mx-auto h-8 w-8 mb-4" />
            <p className="font-medium">Select a component on the canvas to edit its properties.</p>
            <p className="text-sm">Here you can edit general page settings like title, SEO, and more.</p>
        </div>
    </BaseInspector>
  );
}
