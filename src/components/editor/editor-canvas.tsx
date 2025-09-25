'use client';

import { PageContent, PageComponent, ComponentType } from '@/lib/types';
import { ComponentWrapper } from './renderable/component-wrapper';
import { cn } from '@/lib/utils';
import React from 'react';
import { Rocket } from 'lucide-react';

// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: ({ backgroundColor, padding, ...rest }: { backgroundColor: string, padding: string, [key: string]: any }) => (
        <section style={{ backgroundColor, padding: padding || '0px' }} {...rest} />
    ),
    Heading: ({ level, text, align, ...rest }: { level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', text: string, align: string, [key: string]: any }) => {
        const Tag = level;
        return <Tag className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>{text}</Tag>;
    },
    Text: ({ text, align, fontFamily, fontWeight, fontStyle, textDecoration, ...rest }: { text: string, align: string, fontFamily: string, fontWeight: string, fontStyle: string, textDecoration: string, [key: string]: any }) => (
        <p 
            className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })}
            style={{ fontFamily, fontWeight, fontStyle, textDecoration }}
            {...rest}
        >
            {text}
        </p>
    ),
    Button: ({ text, href, align, ...rest }: { text: string, href: string, align: string, [key: string]: any }) => (
        <div className={cn('w-full', { 'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    ),
    Image: ({ src, alt, ...rest }: { src: string, alt: string, [key: string]: any }) => <img src={src} alt={alt} className="max-w-full h-auto" {...rest} />,
    Navbar: ({ backgroundColor, logoText, logoImageUrl, links, ...rest }: { backgroundColor: string, logoText: string, logoImageUrl: string, links: {text: string, href: string}[], [key: string]: any }) => (
        <nav style={{ backgroundColor }} className="p-4" {...rest}>
            <div className="container mx-auto flex justify-between items-center">
                <a href="#" className="flex items-center gap-2 text-xl font-bold">
                    {logoImageUrl ? (
                        <img src={logoImageUrl} alt={logoText} className="h-8" />
                    ) : (
                        <Rocket className="w-6 h-6 text-primary" />
                    )}
                    <span>{logoText}</span>
                </a>
                <div className="hidden md:flex items-center space-x-6">
                    {links.map((link, index) => (
                        <a key={index} href={link.href} className="hover:text-primary">{link.text}</a>
                    ))}
                </div>
            </div>
        </nav>
    ),
    Footer: ({ backgroundColor, copyrightText, ...rest }: { backgroundColor: string, copyrightText: string, [key: string]: any }) => (
        <footer style={{ backgroundColor }} className="p-8 text-gray-300" {...rest}>
            <div className="container mx-auto text-center">
                <p>{copyrightText}</p>
            </div>
        </footer>
    ),
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
