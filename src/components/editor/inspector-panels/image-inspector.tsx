
'use client';

import { ImageComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';
import { PaddingInspector } from './padding-inspector';

interface ImageInspectorProps {
  component: ImageComponent;
  onUpdate: (id: string, newProps: Partial<ImageComponent['props']>) => void;
}

export function ImageInspector({ component, onUpdate }: ImageInspectorProps) {
  const { id, props } = component;
  const { src, alt, width, height } = props;

  return (
    <BaseInspector title="Image">
      <div className="space-y-2">
        <Label htmlFor={`src-${id}`}>Image URL</Label>
        <Input
          id={`src-${id}`}
          value={src}
          onChange={(e) => onUpdate(id, { src: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`alt-${id}`}>Alt Text</Label>
        <Input
          id={`alt-${id}`}
          value={alt}
          onChange={(e) => onUpdate(id, { alt: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`width-${id}`}>Width (px)</Label>
          <Input
            id={`width-${id}`}
            type="number"
            value={width}
            onChange={(e) => onUpdate(id, { width: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`height-${id}`}>Height (px)</Label>
          <Input
            id={`height-${id}`}
            type="number"
            value={height}
            onChange={(e) => onUpdate(id, { height: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </div>
      <PaddingInspector component={component} onUpdate={onUpdate} />
    </BaseInspector>
  );
}
