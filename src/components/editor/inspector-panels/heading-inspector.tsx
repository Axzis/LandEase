'use client';

import { HeadingComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseInspector } from './base-inspector';
import { AIHeadlineGenerator } from '../ai-headline-generator';
import { Separator } from '@/components/ui/separator';

interface HeadingInspectorProps {
  component: HeadingComponent;
  onUpdate: (id: string, newProps: Partial<HeadingComponent['props']>) => void;
}

export function HeadingInspector({ component, onUpdate }: HeadingInspectorProps) {
  const { id, props } = component;
  const { text, level, align } = props;

  return (
    <BaseInspector title="Heading">
      <div className="space-y-2">
        <Label htmlFor={`text-${id}`}>Text</Label>
        <Input
          id={`text-${id}`}
          value={text}
          onChange={(e) => onUpdate(id, { text: e.target.value })}
        />
      </div>

      <Separator />

      <AIHeadlineGenerator
        existingHeadline={text}
        onSelectHeadline={(newHeadline) => onUpdate(id, { text: newHeadline })}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor={`level-${id}`}>Level</Label>
        <Select value={level} onValueChange={(value) => onUpdate(id, { level: value })}>
          <SelectTrigger id={`level-${id}`}>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">H1</SelectItem>
            <SelectItem value="h2">H2</SelectItem>
            <SelectItem value="h3">H3</SelectItem>
            <SelectItem value="h4">H4</SelectItem>
            <SelectItem value="h5">H5</SelectItem>
            <SelectItem value="h6">H6</SelectItem>
          </SelectContent>
        </Select>
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
