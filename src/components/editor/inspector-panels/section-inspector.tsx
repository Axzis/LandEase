'use client';

import { SectionComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface SectionInspectorProps {
  component: SectionComponent;
  onUpdate: (id: string, newProps: Partial<SectionComponent['props']>) => void;
}

export function SectionInspector({ component, onUpdate }: SectionInspectorProps) {
  const { id, props } = component;
  const { backgroundColor, padding, display, flexDirection, alignItems, justifyContent, gap } = props;

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
      
      <Separator />
      
      <h4 className="text-md font-semibold">Layout (Flexbox)</h4>

      <div className="space-y-2">
        <Label htmlFor={`display-${id}`}>Display</Label>
        <Select value={display} onValueChange={(value) => onUpdate(id, { display: value })}>
          <SelectTrigger id={`display-${id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="flex">Flex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {display === 'flex' && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`flexDirection-${id}`}>Direction</Label>
            <Select value={flexDirection} onValueChange={(value) => onUpdate(id, { flexDirection: value })}>
              <SelectTrigger id={`flexDirection-${id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="row">Row (Horizontal)</SelectItem>
                <SelectItem value="column">Column (Vertical)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`justifyContent-${id}`}>Justify Content</Label>
            <Select value={justifyContent} onValueChange={(value) => onUpdate(id, { justifyContent: value })}>
              <SelectTrigger id={`justifyContent-${id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flex-start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="flex-end">End</SelectItem>
                <SelectItem value="space-between">Space Between</SelectItem>
                <SelectItem value="space-around">Space Around</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`alignItems-${id}`}>Align Items</Label>
            <Select value={alignItems} onValueChange={(value) => onUpdate(id, { alignItems: value })}>
              <SelectTrigger id={`alignItems-${id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flex-start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="flex-end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
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
        </>
      )}
    </BaseInspector>
  );
}
