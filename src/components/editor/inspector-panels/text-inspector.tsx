'use client';

import { TextComponent } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BaseInspector } from './base-inspector';

interface TextInspectorProps {
  component: TextComponent;
  onUpdate: (id: string, newProps: Partial<TextComponent['props']>) => void;
}

export function TextInspector({ component, onUpdate }: TextInspectorProps) {
  const { id, props } = component;
  const { text, align } = props;

  return (
    <BaseInspector title="Text">
      <div className="space-y-2">
        <Label htmlFor={`text-${id}`}>Text</Label>
        <Textarea
          id={`text-${id}`}
          value={text}
          onChange={(e) => onUpdate(id, { text: e.target.value })}
          rows={5}
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
