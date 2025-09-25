export type ComponentType = 'Section' | 'Heading' | 'Text' | 'Button' | 'Image' | 'Navbar' | 'Footer';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children?: PageComponent[];
}

export interface SectionComponent extends BaseComponent {
  type: 'Section';
  props: {
    backgroundColor: string;
    padding: string;
  };
  children: PageComponent[];
}

export interface NavbarComponent extends BaseComponent {
  type: 'Navbar';
  props: {
    backgroundColor: string;
  };
  children?: undefined;
}

export interface FooterComponent extends BaseComponent {
  type: 'Footer';
  props: {
    backgroundColor: string;
  };
  children?: undefined;
}

export interface HeadingComponent extends BaseComponent {
  type: 'Heading';
  props: {
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    align: 'left' | 'center' | 'right';
  };
}

export interface TextComponent extends BaseComponent {
  type: 'Text';
  props: {
    text: string;
    align: 'left' | 'center' | 'right';
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'line-through';
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  props: {
    text: string;
    href: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface ImageComponent extends BaseComponent {
  type: 'Image';
  props: {
    src: string;
    alt: string;
  };
}

export type PageComponent = SectionComponent | HeadingComponent | TextComponent | ButtonComponent | ImageComponent | NavbarComponent | FooterComponent;

export type PageContent = PageComponent[];