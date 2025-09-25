
'use client';

import { FormComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';
import { PaddingInspector } from './padding-inspector';
import { Textarea } from '@/components/ui/textarea';

interface FormInspectorProps {
  component: FormComponent;
  onUpdate: (id: string, newProps: Partial<FormComponent['props']>) => void;
}

export function FormInspector({ component, onUpdate }: FormInspectorProps) {
  const { id, props } = component;
  const { title, description, buttonText } = props;

  return (
    <BaseInspector title="Form">
      <div className="space-y-2">
        <Label htmlFor={`title-${id}`}>Form Title</Label>
        <Input
          id={`title-${id}`}
          value={title}
          onChange={(e) => onUpdate(id, { title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          value={description}
          onChange={(e) => onUpdate(id, { description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`buttonText-${id}`}>Button Text</Label>
        <Input
          id={`buttonText-${id}`}
          value={buttonText}
          onChange={(e) => onUpdate(id, { buttonText: e.target.value })}
        />
      </div>

      <PaddingInspector component={component} onUpdate={onUpdate} />
    </BaseInspector>
  );
}
