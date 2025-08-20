'use server';

import type { PageContent, PageComponent } from '@/lib/types';
import { cn } from '@/lib/utils';

// This is a server-side map of components, similar to the one in canvas.tsx,
// but without any client-side interactivity or wrappers.
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: ({ backgroundColor, padding, ...props }) => <section style={{ backgroundColor, padding }} {...props} />,
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

function RenderComponent({ component }: { component: PageComponent }) {
  const Component = componentMap[component.type];
  if (!Component) return <div>Unknown component type: {component.type}</div>;

  return (
    <Component {...component.props}>
      {component.children && component.children.map(child => (
        <RenderComponent 
          key={child.id} 
          component={child as PageComponent} 
        />
      ))}
    </Component>
  );
}


interface PublicPageRendererProps {
  content: PageContent;
}

export async function PublicPageRenderer({ content }: PublicPageRendererProps) {
  return (
    <div className="bg-white">
      {content.map(component => (
        <RenderComponent
          key={component.id}
          component={component}
        />
      ))}
    </div>
  );
}
