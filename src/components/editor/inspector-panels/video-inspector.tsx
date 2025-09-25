
'use client';

import { VideoComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';
import { PaddingInspector } from './padding-inspector';

interface VideoInspectorProps {
  component: VideoComponent;
  onUpdate: (id: string, newProps: Partial<VideoComponent['props']>) => void;
}

export function VideoInspector({ component, onUpdate }: VideoInspectorProps) {
  const { id, props } = component;
  const { src } = props;

  return (
    <BaseInspector title="Video">
      <div className="space-y-2">
        <Label htmlFor={`src-${id}`}>Video URL (YouTube/Vimeo)</Label>
        <Input
          id={`src-${id}`}
          value={src}
          onChange={(e) => onUpdate(id, { src: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
            Paste a link from YouTube or Vimeo.
        </p>
      </div>
      <PaddingInspector component={component} onUpdate={onUpdate} />
    </BaseInspector>
  );
}
