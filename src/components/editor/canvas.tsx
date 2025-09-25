

import { EditorCanvas } from './editor-canvas';
import { PageContent, PageComponent, ComponentType } from '@/lib/types';

interface CanvasProps {
  content: PageContent;
  onSelectComponent: (id: string | null) => void;
  selectedComponentId: string | null;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType, parentId: string | null, targetId: string | null) => void;
  onMoveComponent: (draggedId: string, targetId: string) => void;
}

export function Canvas({ content, onSelectComponent, selectedComponentId, onDeleteComponent, onAddComponent, onMoveComponent }: CanvasProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent drop from bubbling to child wrappers
    if (e.target !== e.currentTarget) {
        // This drop should be handled by a nested ComponentWrapper, not the main canvas.
        return;
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'new-component') {
        // Dropping on the canvas background adds the component to the end of the page at root level.
        onAddComponent(data.componentType, null, null);
      }
    } catch(err) {
      console.error("Invalid drop data on canvas:", err);
    }
  };

  return (
    <div 
      className="p-4 bg-white h-full relative"
      onClick={(e) => {
        // Clicks on the canvas background deselect components
        if (e.target === e.currentTarget) {
          onSelectComponent(null);
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <EditorCanvas
          content={content}
          onSelectComponent={onSelectComponent}
          selectedComponentId={selectedComponentId}
          onDeleteComponent={onDeleteComponent}
          onAddComponent={onAddComponent}
          onMoveComponent={onMoveComponent}
        />
       {content.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  <p className="font-semibold">Canvas is empty.</p>
                  <p>Drag components from the left panel and drop them here.</p>
              </div>
          </div>
      )}
    </div>
  );
}
