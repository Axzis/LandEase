
import { EditorCanvas } from './editor-canvas';
import { PageContent, PageComponent, ComponentType } from '@/lib/types';

interface CanvasProps {
  content: PageContent;
  onSelectComponent: (id: string | null) => void;
  selectedComponentId: string | null;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
  onMoveComponent: (draggedId: string, targetId: string | null, parentId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
  pageBackgroundColor: string;
}

export function Canvas({ content, onSelectComponent, selectedComponentId, onDeleteComponent, onAddComponent, onMoveComponent, pageBackgroundColor }: CanvasProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    const isDroppingOnCanvasBackground = e.target === e.currentTarget;
    if (!isDroppingOnCanvasBackground) {
        return;
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'new-component') {
        onAddComponent(data.componentType, null, null, 'bottom');
      } else if (data.type === 'move-component') {
        onMoveComponent(data.componentId, null, null, 'bottom');
      }
    } catch(err) {
      console.error("Invalid drop data on canvas:", err);
    }
  };

  return (
    <div 
      className="p-4 h-full relative"
      style={{ backgroundColor: pageBackgroundColor }}
      onClick={(e) => {
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
