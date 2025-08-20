import { Card, CardContent } from '@/components/ui/card';
import { Heading1, Type, Image as ImageIcon, RectangleHorizontal, MousePointerClick } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const components = [
  { name: 'Section', icon: <RectangleHorizontal />, type: 'Section' },
  { name: 'Heading', icon: <Heading1 />, type: 'Heading' },
  { name: 'Text', icon: <Type />, type: 'Text' },
  { name: 'Button', icon: <MousePointerClick />, type: 'Button' },
  { name: 'Image', icon: <ImageIcon />, type: 'Image' },
];

export function ComponentPalette() {
  return (
    <aside className="w-60 bg-background border-r flex-shrink-0 basis-60">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Components</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="p-4 grid grid-cols-2 gap-4">
          {components.map((component) => (
            <div
              key={component.name}
              className="p-2 border rounded-lg flex flex-col items-center justify-center text-center cursor-grab hover:bg-secondary transition-colors duration-200"
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('text/plain', component.type)}
            >
              <div className="text-primary">{component.icon}</div>
              <span className="text-xs mt-2 font-medium">{component.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
