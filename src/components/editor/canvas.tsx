'use client';

import { PageContent, PageComponent, ComponentType } from '@/lib/types';
import { ComponentWrapper } from './renderable/component-wrapper';
import { cn } from '@/lib/utils';

// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: (props) => <section style={{ backgroundColor: props.backgroundColor, padding: props.padding }} {...props} />,
    Heading: ({ level, text, align, ...props }) => {
        const Tag = level as keyof JSX.IntrinsicElements;
        return <Tag className={cn('text-left', { 'text-center': align === 'center', 'text-right': align === 'right' })} {...props}>{text}</Tag>;
    },
    Text: ({ text, align, ...props }) => <p className={cn('text-left', { 'text-center': align === 'center', 'text-right': align === 'right' })} {...props}>{text}</p>,
    Button: ({ text, href, align, ...props }) => (
        <div className={cn('w-full', { 'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...props}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    ),
    Image: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} className="max-w-full h-auto" />,
};


function RenderComponent({ 
    component, 
    onSelectComponent, 
    selectedComponentId, 
    onDeleteComponent,
    onAddComponent,
    onMoveComponent,
}: { 
    component: PageComponent, 
    onSelectComponent: (id: string) => void,
    selectedComponentId: string | null,
    onDeleteComponent: (id: string) => void
    onAddComponent: (type: ComponentType, parentId: string | null, targetId: string | null) => void;
    onMoveComponent: (draggedId: string, targetId: string) => void;
}) {
  const Component = componentMap[component.type];
  if (!Component) return <div>Unknown component type: {component.type}</div>;

  return (
    <ComponentWrapper
      component={component}
      onSelect={onSelectComponent}
      onDelete={onDeleteComponent}
      isSelected={component.id === selectedComponentId}
      onAddComponent={onAddComponent}
      onMoveComponent={onMoveComponent}
    >
      <Component {...component.props}>
        {component.children && component.children.map(child => (
          <RenderComponent 
            key={child.id} 
            component={child as PageComponent} 
            onSelectComponent={onSelectComponent}
            selectedComponentId={selectedComponentId}
            onDeleteComponent={onDeleteComponent}
            onAddComponent={onAddComponent}
            onMoveComponent={onMoveComponent}
          />
        ))}
      </Component>
    </ComponentWrapper>
  );
}


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
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'new-component') {
        // Dropping on the canvas background adds the component to the end of the page
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
      {content.map(component => (
        <RenderComponent
          key={component.id}
          component={component}
          onSelectComponent={onSelectComponent}
          selectedComponentId={selectedComponentId}
          onDeleteComponent={onDeleteComponent}
          onAddComponent={onAddComponent}
          onMoveComponent={onMoveComponent}
        />
      ))}
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
