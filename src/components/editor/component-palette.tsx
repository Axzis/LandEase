import { Heading1, Type, Image as ImageIcon, RectangleHorizontal, MousePointerClick } from 'lucide-react';
import { ComponentType } from '@/lib/types';

const components: { name: string; icon: JSX.Element; type: ComponentType }[] = [
  { name: 'Section', icon: <RectangleHorizontal />, type: 'Section' },
  { name: 'Heading', icon: <Heading1 />, type: 'Heading' },
  { name: 'Text', icon: <Type />, type: 'Text' },
  { name: 'Button', icon: <MousePointerClick />, type: 'Button' },
  { name: 'Image', icon: <ImageIcon />, type: 'Image' },
];

export function ComponentPalette() {
  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    const data = JSON.stringify({
      type: 'new-component',
      componentType: type,
    });
    e.dataTransfer.setData('text/plain', data);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Components</h2>
      <div className="grid grid-cols-2 gap-4">
        {components.map((component) => (
          <div
            key={component.name}
            className="p-2 border rounded-lg flex flex-col items-center justify-center text-center cursor-grab hover:bg-secondary transition-colors duration-200"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, component.type)}
          >
            <div className="text-primary">{component.icon}</div>
            <span className="text-xs mt-2 font-medium">{component.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
