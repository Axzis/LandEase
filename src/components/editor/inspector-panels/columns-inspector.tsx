
'use client';

import { ColumnsComponent } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseInspector } from './base-inspector';
import { Input } from '@/components/ui/input';

interface ColumnsInspectorProps {
  component: ColumnsComponent;
  onUpdate: (id: string, newProps: Partial<ColumnsComponent['props']>) => void;
}

export function ColumnsInspector({ component, onUpdate }: ColumnsInspectorProps) {
  const { id, props } = component;
  const { numberOfColumns, gap } = props;

  return (
    <BaseInspector title="Columns">
      <div className="space-y-2">
        <Label htmlFor={`numberOfColumns-${id}`}>Number of Columns</Label>
        <Select 
          value={String(numberOfColumns)} 
          onValueChange={(value) => onUpdate(id, { numberOfColumns: parseInt(value, 10) })}
        >
          <SelectTrigger id={`numberOfColumns-${id}`}>
            <SelectValue placeholder="Select number of columns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`gap-${id}`}>Gap (e.g. 16px, 1rem)</Label>
        <Input
          id={`gap-${id}`}
          value={gap}
          onChange={(e) => onUpdate(id, { gap: e.target.value })}
        />
      </div>
    </BaseInspector>
  );
}
