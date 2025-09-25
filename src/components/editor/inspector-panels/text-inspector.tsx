'use client';

import { TextComponent } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BaseInspector } from './base-inspector';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AITextGenerator } from '../ai-text-generator';

interface TextInspectorProps {
  component: TextComponent;
  onUpdate: (id: string, newProps: Partial<TextComponent['props']>) => void;
}

const fontFamilies = [
  'Inter',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
];

export function TextInspector({ component, onUpdate }: TextInspectorProps) {
  const { id, props } = component;
  const { text, align, fontFamily, fontWeight, fontStyle, textDecoration } = props;

  const toggleStyle = (property: 'fontWeight' | 'fontStyle' | 'textDecoration', onValue: any, offValue: any) => {
    const currentValue = props[property];
    onUpdate(id, { [property]: currentValue === onValue ? offValue : onValue });
  };

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

      <Separator />

      <AITextGenerator onGeneratedText={(newText) => onUpdate(id, { text: newText })} />
      
      <Separator />
      
      <div className="space-y-2">
        <Label>Styling</Label>
        <div className="flex gap-2">
          <Button
            variant={fontWeight === 'bold' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => toggleStyle('fontWeight', 'bold', 'normal')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={fontStyle === 'italic' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => toggleStyle('fontStyle', 'italic', 'normal')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={textDecoration === 'line-through' ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => toggleStyle('textDecoration', 'line-through', 'none')}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`fontFamily-${id}`}>Font Family</Label>
        <Select value={fontFamily || 'Inter'} onValueChange={(value) => onUpdate(id, { fontFamily: value })}>
          <SelectTrigger id={`fontFamily-${id}`}>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map(font => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
            ))}
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
