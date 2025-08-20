'use client';

import { SectionComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';

interface SectionInspectorProps {
  component: SectionComponent;
  onUpdate: (id: string, newProps: Partial<SectionComponent['props']>) => void;
}

export function SectionInspector({ component, onUpdate }: SectionInspectorProps) {
  const { id, props } = component;
  const { backgroundColor, padding } = props;

  return (
    <BaseInspector title="Section">
      <div className="space-y-2">
        <Label htmlFor={`backgroundColor-${id}`}>Background Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            id={`backgroundColor-picker-${id}`}
            value={backgroundColor}
            onChange={(e) => onUpdate(id, { backgroundColor: e.target.value })}
            className="p-1 h-10 w-10"
          />
          <Input
            id={`backgroundColor-${id}`}
            value={backgroundColor}
            onChange={(e) => onUpdate(id, { backgroundColor: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`padding-${id}`}>Padding (e.g. 64px, 2rem)</Label>
        <Input
          id={`padding-${id}`}
          value={padding}
          onChange={(e) => onUpdate(id, { padding: e.target.value })}
        />
      </div>
    </BaseInspector>
  );
}
