'use client';

import { PageContent, PageComponent, ComponentType } from '@/lib/types';
import { ComponentWrapper } from './renderable/component-wrapper';
import { cn } from '@/lib/utils';
import React from 'react';
import { Rocket } from 'lucide-react';

// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: React.forwardRef<HTMLElement, { backgroundColor: string, padding: string, display: string, flexDirection: string, alignItems: string, justifyContent: string, gap: string, [key: string]: any }>(({ backgroundColor, padding, display, flexDirection, alignItems, justifyContent, gap, ...rest }, ref) => (
        <section ref={ref} style={{ backgroundColor, padding, display, flexDirection, alignItems, justifyContent, gap }} {...rest} />
    )),
    Heading: React.forwardRef<HTMLHeadingElement, { level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', text: string, align: string, [key: string]: any }>(({ level, text, align, ...rest }, ref) => {
        const Tag = level;
        return <Tag ref={ref} className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>{text}</Tag>;
    }),
    Text: React.forwardRef<HTMLParagraphElement, { text: string, align: string, fontFamily: string, fontWeight: string, fontStyle: string, textDecoration: string, [key: string]: any }>(({ text, align, fontFamily, fontWeight, fontStyle, textDecoration, ...rest }, ref) => (
        <p 
            ref={ref}
            className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })}
            style={{ fontFamily, fontWeight, fontStyle, textDecoration }}
            {...rest}
        >
            {text}
        </p>
    )),
    Button: React.forwardRef<HTMLDivElement, { text: string, href: string, align: string, [key: string]: any }>(({ text, href, align, ...rest }, ref) => (
        <div ref={ref} className={cn('w-full', { 'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} {...rest}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    )),
    Image: React.forwardRef<HTMLImageElement, { src: string, alt: string, width: number, height: number, [key: string]: any }>(({ src, alt, width, height, ...rest }, ref) => <img ref={ref} src={src} alt={alt} style={{ width: `${width}px`, height: `${height}px` }} className="max-w-full" {...rest} />),
    Navbar: React.forwardRef<HTMLElement, { backgroundColor: string, logoText: string, logoImageUrl: string, links: {text: string, href: string}[], [key: string]: any }>(({ backgroundColor, logoText, logoImageUrl, links, ...rest }, ref) => (
        <nav ref={ref} style={{ backgroundColor }} className="p-4" {...rest}>
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
                    {(links || []).map((link, index) => (
                        <a key={index} href={link.href} className="hover:text-primary">{link.text}</a>
                    ))}
                </div>
            </div>
        </nav>
    )),
    Footer: React.forwardRef<HTMLElement, { backgroundColor: string, copyrightText: string, [key: string]: any }>(({ backgroundColor, copyrightText, ...rest }, ref) => (
        <footer ref={ref} style={{ backgroundColor }} className="p-8 text-gray-300" {...rest}>
            <div className="container mx-auto text-center">
                <p>{copyrightText}</p>
            </div>
        </footer>
    )),
};


function RenderComponent({
    component, 
    onSelectComponent, 
    selectedComponentId, 
    onDeleteComponent,
    onAddComponent,
    onMoveComponent,
    readOnly = false,
    parentPath = '',
}: { 
    component: PageComponent, 
    onSelectComponent?: (id: string, path: string) => void,
    selectedComponentId?: string | null,
    onDeleteComponent?: (id: string) => void
    onAddComponent?: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom') => void;
    onMoveComponent?: (draggedId: string, targetId: string, parentId: string | null, position: 'top' | 'bottom') => void;
    readOnly?: boolean;
    parentPath?: string;
}) {
  const Component = componentMap[component.type];
  if (!Component) return <div>Unknown component type: {component.type}</div>;

  const currentPath = parentPath ? `${parentPath}.${component.id}` : component.id;

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
            parentPath={currentPath}
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
      path={currentPath}
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
    onAddComponent?: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom') => void;
    onMoveComponent?: (draggedId: string, targetId: string, parentId: string | null, position: 'top' | 'bottom') => void;
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
          onSelectComponent={onSelectComponent as any}
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
