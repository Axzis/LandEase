import { Settings } from 'lucide-react';
import { BaseInspector } from './base-inspector';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface PageInspectorProps {
    backgroundColor: string;
    onUpdateBackgroundColor: (color: string) => void;
    thumbnailUrl: string;
    onUpdateThumbnailUrl: (url: string) => void;
}

export function PageInspector({ backgroundColor, onUpdateBackgroundColor, thumbnailUrl, onUpdateThumbnailUrl }: PageInspectorProps) {
  return (
    <div>
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Page Properties</h3>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="page-backgroundColor">Background Color</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        id="page-backgroundColor-picker"
                        value={backgroundColor}
                        onChange={(e) => onUpdateBackgroundColor(e.target.value)}
                        className="p-1 h-10 w-10"
                    />
                    <Input
                        id="page-backgroundColor"
                        value={backgroundColor}
                        onChange={(e) => onUpdateBackgroundColor(e.target.value)}
                    />
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <Label htmlFor="page-thumbnailUrl">Thumbnail URL</Label>
                <Input
                    id="page-thumbnailUrl"
                    value={thumbnailUrl}
                    onChange={(e) => onUpdateThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                />
                 <p className="text-xs text-muted-foreground">
                    This image will be shown on the dashboard.
                </p>
            </div>

            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-8">
                <Settings className="mx-auto h-8 w-8 mb-4" />
                <p className="font-medium">Select a component on the canvas to edit its properties.</p>
            </div>
        </div>
    </div>
  );
}
