

'use client';

import { PageContent, PageComponent, ComponentType } from '@/lib/types';
import { ComponentWrapper } from './renderable/component-wrapper';
import { cn } from '@/lib/utils';
import React from 'react';
import { Rocket } from 'lucide-react';

const getEmbedUrl = (url: string): string | null => {
    let videoId;
    if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('youtu.be/')) {
        videoId = new URL(url).pathname.substring(1);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('vimeo.com/')) {
        videoId = new URL(url).pathname.substring(1);
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    // If it's already an embed URL
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
        return url;
    }
    return null;
}


// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: React.forwardRef<HTMLElement, { backgroundColor: string, padding: string, display: string, flexDirection: string, alignItems: string, justifyContent: string, gap: string, [key: string]: any }>(({ backgroundColor, padding, display, flexDirection, alignItems, justifyContent, gap, ...rest }, ref) => (
        <section ref={ref} style={{ backgroundColor, padding, display, flexDirection, alignItems, justifyContent, gap }} {...rest} />
    )),
    Columns: React.forwardRef<HTMLDivElement, { numberOfColumns: number, gap: string, children: React.ReactNode, [key: string]: any }>(({ numberOfColumns, gap, children, ...rest }, ref) => (
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${numberOfColumns}, 1fr)`, gap }} {...rest}>
            {children}
        </div>
    )),
    Heading: React.forwardRef<HTMLHeadingElement, { level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', text: string, align: string, padding: string, [key: string]: any }>(({ level, text, align, padding, ...rest }, ref) => {
        const Tag = level;
        const sizeClasses = {
            h1: 'text-4xl md:text-5xl font-bold',
            h2: 'text-3xl md:text-4xl font-bold',
            h3: 'text-2xl md:text-3xl font-semibold',
            h4: 'text-xl md:text-2xl font-semibold',
            h5: 'text-lg md:text-xl font-medium',
            h6: 'text-base md:text-lg font-medium',
        };
        return <Tag ref={ref} className={cn('w-full', sizeClasses[level], {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} style={{ padding }} {...rest}>{text}</Tag>;
    }),
    Text: React.forwardRef<HTMLParagraphElement, { text: string, align: string, fontFamily: string, fontWeight: string, fontStyle: string, textDecoration: string, padding: string, [key: string]: any }>(({ text, align, fontFamily, fontWeight, fontStyle, textDecoration, padding, ...rest }, ref) => (
        <p 
            ref={ref}
            className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })}
            style={{ fontFamily, fontWeight, fontStyle, textDecoration, padding }}
            {...rest}
        >
            {text}
        </p>
    )),
    Button: React.forwardRef<HTMLDivElement, { text: string, href: string, align: string, padding: string, [key: string]: any }>(({ text, href, align, padding, ...rest }, ref) => (
        <div ref={ref} className={cn('w-full', { 'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })} style={{ padding }} {...rest}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    )),
    Image: React.forwardRef<HTMLImageElement, { src: string, alt: string, width: number, height: number, padding: string, [key: string]: any }>(({ src, alt, width, height, padding, ...rest }, ref) => (
        <div ref={ref} style={{ padding }} {...rest}>
            <img src={src} alt={alt} style={{ width: `${width}px`, height: `${height}px` }} className="max-w-full" />
        </div>
    )),
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
    Video: React.forwardRef<HTMLDivElement, { src: string, padding: string, [key: string]: any }>(({ src, padding, ...rest }, ref) => {
        const embedUrl = getEmbedUrl(src);
        return (
            <div ref={ref} style={{ padding }} {...rest}>
                {embedUrl ? (
                     <div className="aspect-w-16 aspect-h-9">
                        <iframe
                            src={embedUrl}
                            title="Embedded video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                            style={{aspectRatio: '16/9'}}
                        ></iframe>
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-500">
                        Invalid Video URL. Please provide a valid YouTube or Vimeo link.
                    </div>
                )}
            </div>
        )
    }),
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
    onAddComponent?: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
    onMoveComponent?: (draggedId: string, targetId: string | null, parentId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
    readOnly?: boolean;
    parentPath?: string;
}) {
  const Component = componentMap[component.type];
  if (!Component) return <div>Unknown component type: {component.type}</div>;

  const currentPath = parentPath ? `${parentPath}.${component.id}` : component.id;

  let childrenToRender;

  if (component.type === 'Columns' && Array.isArray(component.children)) {
    childrenToRender = component.children.map((column, colIndex) => (
        <ColumnDropZone 
            key={colIndex}
            components={column}
            columnIndex={colIndex}
            parentId={component.id}
            parentPath={currentPath}
            onSelectComponent={onSelectComponent}
            selectedComponentId={selectedComponentId}
            onDeleteComponent={onDeleteComponent}
            onAddComponent={onAddComponent}
            onMoveComponent={onMoveComponent}
            readOnly={readOnly}
        />
    ));
  } else if (component.type === 'Section' && Array.isArray(component.children)) {
      childrenToRender = (component.children as PageComponent[]).map(child => (
        <RenderComponent 
          key={child.id} 
          component={child} 
          onSelectComponent={onSelectComponent}
          selectedComponentId={selectedComponentId}
          onDeleteComponent={onDeleteComponent}
          onAddComponent={onAddComponent}
          onMoveComponent={onMoveComponent}
          readOnly={readOnly}
          parentPath={currentPath}
        />
      ));
  }

  const componentContent = (
    <Component {...component.props}>
        {childrenToRender}
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

function ColumnDropZone({ components, columnIndex, parentId, parentPath, ...props }: any) {
    const { onAddComponent, onMoveComponent, readOnly } = props;

    const handleDragOver = (e: React.DragEvent) => {
        if(readOnly) return;
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        if(readOnly) return;
        e.preventDefault();
        e.stopPropagation();

        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        
        if (data.type === 'new-component') {
            onAddComponent(data.componentType, parentId, null, 'bottom', columnIndex);
        } else if (data.type === 'move-component') {
            onMoveComponent(data.componentId, null, parentId, 'bottom', columnIndex);
        }
    };
    
    return (
        <div 
            className={cn(
                "min-h-[100px] flex flex-col gap-2",
                !readOnly && "p-2 border border-dashed border-gray-400 bg-gray-50/50"
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-column-index={columnIndex}
            data-parent-id={parentId}
        >
            {components.map((component: PageComponent) => (
                <RenderComponent key={component.id} component={component} parentPath={`${parentPath}.col${columnIndex}`} {...props} />
            ))}
            {!readOnly && components.length === 0 && (
                 <div className="text-center text-xs text-gray-500 self-center">Drop here</div>
            )}
        </div>
    )
}

interface EditorCanvasProps {
    content: PageContent;
    onSelectComponent?: (id: string | null) => void;
    selectedComponentId?: string | null;
    onDeleteComponent?: (id: string) => void;
    onAddComponent?: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
    onMoveComponent?: (draggedId: string, targetId: string | null, parentId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
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
