
'use client';

import { PageComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface PaddingInspectorProps {
  component: PageComponent;
  onUpdate: (id: string, newProps: { padding: string }) => void;
}

export function PaddingInspector({ component, onUpdate }: PaddingInspectorProps) {
  const { id, props } = component;
  const { padding } = props;

  return (
    <>
        <Separator />
        <div className="space-y-2">
            <Label htmlFor={`padding-${id}`}>Padding (e.g. 16px, 1rem)</Label>
            <Input
            id={`padding-${id}`}
            value={padding}
            onChange={(e) => onUpdate(id, { padding: e.target.value })}
            />
        </div>
    </>
  );
}
