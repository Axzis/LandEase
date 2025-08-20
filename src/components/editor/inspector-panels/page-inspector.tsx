import { Settings } from 'lucide-react';
import { BaseInspector } from './base-inspector';

export function PageInspector() {
  return (
    <div className='h-full flex flex-col'>
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Properties</h3>
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg flex-grow flex flex-col justify-center">
            <Settings className="mx-auto h-8 w-8 mb-4" />
            <p className="font-medium">Select a component on the canvas to edit its properties.</p>
        </div>
    </div>
  );
}
