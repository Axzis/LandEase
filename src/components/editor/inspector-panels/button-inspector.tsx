'use client';

import { ButtonComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseInspector } from './base-inspector';

interface ButtonInspectorProps {
  component: ButtonComponent;
  onUpdate: (id: string, newProps: Partial<ButtonComponent['props']>) => void;
}

export function ButtonInspector({ component, onUpdate }: ButtonInspectorProps) {
  const { id, props } = component;
  const { text, href, align } = props;

  return (
    <BaseInspector title="Button">
      <div className="space-y-2">
        <Label htmlFor={`text-${id}`}>Button Text</Label>
        <Input
          id={`text-${id}`}
          value={text}
          onChange={(e) => onUpdate(id, { text: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`href-${id}`}>Link URL</Label>
        <Input
          id={`href-${id}`}
          value={href}
          onChange={(e) => onUpdate(id, { href: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`align-${id}`}>Alignment</Label>
        <Select value={align} onValueChange={(value) => onUpdate(id, { align: value })}>
          <SelectTrigger id={`align-${id}`}>
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </BaseInspector>
  );
}
