

'use client';

import { PageContent, PageComponent, ComponentType } from '@/lib/types';
import { ComponentWrapper } from './renderable/component-wrapper';
import { cn } from '@/lib/utils';
import React from 'react';

// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: ({ backgroundColor, padding, ...rest }) => (
        <section style={{ backgroundColor, padding: padding || '0px' }} {...rest} />
    ),
    Heading: ({ level, text, align, ...rest }) => {
        const Tag = level as keyof JSX.IntrinsicElements;
        return <Tag className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>{text}</Tag>;
    },
    Text: ({ text, align, ...rest }) => <p className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>{text}</p>,
    Button: ({ text, href, align, ...rest }) => (
        <div className={cn('w-full', { 'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    ),
    Image: ({ src, alt, ...rest }) => <img src={src} alt={alt} className="max-w-full h-auto" {...rest} />,
};


function RenderComponent({
    component, 
    onSelectComponent, 
    selectedComponentId, 
    onDeleteComponent,
    onAddComponent,
    onMoveComponent,
    readOnly = false,
}: { 
    component: PageComponent, 
    onSelectComponent?: (id: string) => void,
    selectedComponentId?: string | null,
    onDeleteComponent?: (id: string) => void
    onAddComponent?: (type: ComponentType, parentId: string | null, targetId: string | null) => void;
    onMoveComponent?: (draggedId: string, targetId: string) => void;
    readOnly?: boolean;
}) {
  const Component = componentMap[component.type];
  if (!Component) return <div>Unknown component type: {component.type}</div>;

  const componentContent = (
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
            readOnly={readOnly}
          />
        ))}
    </Component>
  );

  if (readOnly) {
      return componentContent;
  }

  return (
    <ComponentWrapper
      component={component}
      onSelect={onSelectComponent!}
      onDelete={onDeleteComponent!}
      isSelected={component.id === selectedComponentId}
      onAddComponent={onAddComponent!}
      onMoveComponent={onMoveComponent!}
    >
      {componentContent}
    </ComponentWrapper>
  );
}

interface EditorCanvasProps {
    content: PageContent;
    onSelectComponent?: (id: string | null) => void;
    selectedComponentId?: string | null;
    onDeleteComponent?: (id: string) => void;
    onAddComponent?: (type: ComponentType, parentId: string | null, targetId: string | null) => void;
    onMoveComponent?: (draggedId: string, targetId: string) => void;
    readOnly?: boolean;
  }

export function EditorCanvas({
  content,
  onSelectComponent,
  selectedComponentId,
  onDeleteComponent,
  onAddComponent,
  onMoveComponent,
  readOnly = false,
}: EditorCanvasProps) {
  return (
    <>
      {content.map(component => (
        <RenderComponent
          key={component.id}
          component={component}
          onSelectComponent={onSelectComponent}
          selectedComponentId={selectedComponentId}
          onDeleteComponent={onDeleteComponent}
          onAddComponent={onAddComponent}
          onMoveComponent={onMoveComponent}
          readOnly={readOnly}
        />
      ))}
    </>
  );
}
