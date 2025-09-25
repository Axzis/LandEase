'use client';

import { FooterComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';

interface FooterInspectorProps {
  component: FooterComponent;
  onUpdate: (id: string, newProps: Partial<FooterComponent['props']>) => void;
}

export function FooterInspector({ component, onUpdate }: FooterInspectorProps) {
  const { id, props } = component;
  const { backgroundColor } = props;

  return (
    <BaseInspector title="Footer">
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
    </BaseInspector>
  );
}