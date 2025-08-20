'use client';

import { PageContent, PageComponent } from '@/lib/types';
import { ComponentWrapper } from './renderable/component-wrapper';

// A map to dynamically render components based on their type
const componentMap: { [key: string]: React.ComponentType<any> } = {
    Section: (props) => <section style={{ backgroundColor: props.backgroundColor, padding: props.padding }} {...props} />,
    Heading: ({ level, text, align, ...props }) => {
        const Tag = level as keyof JSX.IntrinsicElements;
        return <Tag style={{ textAlign: align }} {...props}>{text}</Tag>;
    },
    Text: ({ text, align, ...props }) => <p style={{ textAlign: align }} {...props}>{text}</p>,
    Button: ({ text, href, align, ...props }) => (
        <div style={{ textAlign: align }} {...props}>
            <a href={href} className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors duration-200 hover:bg-primary/90">{text}</a>
        </div>
    ),
    Image: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} className="max-w-full h-auto" />,
};


function RenderComponent({ component, onSelectComponent, selectedComponentId, onDeleteComponent }: { 
    component: PageComponent, 
    onSelectComponent: (id: string) => void,
    selectedComponentId: string | null,
    onDeleteComponent: (id: string) => void
}) {
  const Component = componentMap[component.type];
  if (!Component) return <div>Unknown component type: {component.type}</div>;

  return (
    <ComponentWrapper
      id={component.id}
      type={component.type}
      onSelect={onSelectComponent}
      onDelete={onDeleteComponent}
      isSelected={component.id === selectedComponentId}
    >
      <Component {...component.props}>
        {component.children && component.children.map(child => (
          <RenderComponent 
            key={child.id} 
            component={child as PageComponent} 
            onSelectComponent={onSelectComponent}
            selectedComponentId={selectedComponentId}
            onDeleteComponent={onDeleteComponent}
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
}

export function Canvas({ content, onSelectComponent, selectedComponentId, onDeleteComponent }: CanvasProps) {
  return (
    <div 
      className="p-4 bg-white h-full"
      onClick={(e) => {
        // Clicks on the canvas background deselect components
        if (e.target === e.currentTarget) {
          onSelectComponent(null);
        }
      }}
    >
      {content.map(component => (
        <RenderComponent
          key={component.id}
          component={component}
          onSelectComponent={onSelectComponent}
          selectedComponentId={selectedComponentId}
          onDeleteComponent={onDeleteComponent}
        />
      ))}
    </div>
  );
}
