
export type ComponentType = 'Section' | 'Heading' | 'Text' | 'Button' | 'Image' | 'Navbar' | 'Footer' | 'Columns' | 'Video' | 'Form';

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
    display: 'block' | 'flex';
    flexDirection: 'row' | 'column';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    gap: string;
  };
  children: PageComponent[];
}

export interface Column {
    id: string;
    children: PageComponent[];
}

export interface ColumnsComponent extends BaseComponent {
    type: 'Columns';
    props: {
        numberOfColumns: number;
        gap: string;
    };
    // children is not used, instead 'columns' property is used.
    children?: undefined; 
    columns: Column[]; 
}

export interface NavbarComponent extends BaseComponent {
  type: 'Navbar';
  props: {
    backgroundColor: string;
    logoText: string;
    logoImageUrl: string;
    links: { text: string; href: string }[];
  };
  children?: undefined;
}

export interface FooterComponent extends BaseComponent {
  type: 'Footer';
  props: {
    backgroundColor: string;
    copyrightText: string;
  };
  children?: undefined;
}

export interface HeadingComponent extends BaseComponent {
  type: 'Heading';
  props: {
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    align: 'left' | 'center' | 'right';
    padding: string;
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
    padding: string;
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  props: {
    text: string;
    href: string;
    align: 'left' | 'center' | 'right';
    padding: string;
  };
}

export interface ImageComponent extends BaseComponent {
  type: 'Image';
  props: {
    src: string;
    alt: string;
    width: number;
    height: number;
    padding: string;
  };
}

export interface VideoComponent extends BaseComponent {
  type: 'Video';
  props: {
    src: string;
    padding: string;
  };
}

export interface FormField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea';
    placeholder?: string;
    required: boolean;
}

export interface FormComponent extends BaseComponent {
  type: 'Form';
  props: {
    title: string;
    description: string;
    buttonText: string;
    padding: string;
    fields: FormField[];
  };
}


export type PageComponent = SectionComponent | HeadingComponent | TextComponent | ButtonComponent | ImageComponent | NavbarComponent | FooterComponent | ColumnsComponent | VideoComponent | FormComponent;

export type PageContent = PageComponent[];

// New type for the public-facing page data
export interface PublishedPage {
    content: PageContent;
    pageName: string;
    pageBackgroundColor: string;
    pageId: string;
    userId: string;
}
