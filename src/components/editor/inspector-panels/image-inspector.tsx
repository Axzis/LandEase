'use client';

import { ImageComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';

interface ImageInspectorProps {
  component: ImageComponent;
  onUpdate: (id: string, newProps: Partial<ImageComponent['props']>) => void;
}

export function ImageInspector({ component, onUpdate }: ImageInspectorProps) {
  const { id, props } = component;
  const { src, alt } = props;

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
    </BaseInspector>
  );
}
