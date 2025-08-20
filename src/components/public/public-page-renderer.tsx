
import { PageContent, PageComponent } from '@/lib/types';
import { cn } from '@/lib/utils';

// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: ({ backgroundColor, padding, children }) => (
        <section style={{ backgroundColor, padding }}>
            {children}
        </section>
    ),
    Heading: ({ level, text, align }) => {
        const Tag = level as keyof JSX.IntrinsicElements;
        return <Tag className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })}>{text}</Tag>;
    },
    Text: ({ text, align }) => <p className={cn('w-full', {'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })}>{text}</p>,
    Button: ({ text, href, align }) => (
        <div className={cn('w-full', { 'text-left': align === 'left', 'text-center': align === 'center', 'text-right': align === 'right' })}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    ),
    Image: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full h-auto" />,
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

export function PublicPageRenderer({ content }: PublicPageRendererProps) {
  return (
    <main>
      {content.map(component => (
        <RenderComponent
          key={component.id}
          component={component}
        />
      ))}
    </main>
  );
}
