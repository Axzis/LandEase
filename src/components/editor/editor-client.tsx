'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { PageContent, PageComponent, ComponentType } from '@/lib/types';
import { ComponentPalette } from './component-palette';
import { Canvas } from './canvas';
import { InspectorPanel } from './inspector-panel';
import { Button } from '../ui/button';
import { Loader2, Save, ArrowLeft, Dot, Link as LinkIcon, Globe } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Rocket } from 'lucide-react';

interface EditorClientProps {
  pageData: {
    id: string;
    pageName: string;
    content: PageContent;
    published?: boolean;
    projectId?: string;
    pageBackgroundColor?: string;
  };
}

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createNewComponent = (type: ComponentType): PageComponent => {
  const id = generateId();
  switch (type) {
    case 'Section':
      return { id, type: 'Section', props: { backgroundColor: 'transparent', padding: '16px', display: 'block', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', gap: '16px' }, children: [] };
    case 'Heading':
      return { id, type: 'Heading', props: { text: 'New Heading', level: 'h2', align: 'left' } };
    case 'Text':
      return { id, type: 'Text', props: { text: 'This is a new text block. Click to edit.', align: 'left', fontFamily: 'Inter', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' } };
    case 'Button':
      return { id, type: 'Button', props: { text: 'Click Me', href: '#', align: 'left' } };
    case 'Image':
      return { id, type: 'Image', props: { src: 'https://placehold.co/600x400', alt: 'Placeholder image', width: 600, height: 400 } };
    case 'Navbar':
      return { id, type: 'Navbar', props: { backgroundColor: '#FFFFFF', logoText: 'LandEase', logoImageUrl: '', links: [{text: 'Home', href: '#'}, {text: 'About', href: '#'}, {text: 'Contact', href: '#'}] } };
    case 'Footer':
      return { id, type: 'Footer', props: { backgroundColor: '#1F2937', copyrightText: `© ${new Date().getFullYear()} Your Company. All rights reserved.` } };
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
};


export function EditorClient({ pageData }: EditorClientProps) {
  const [pageName, setPageName] = useState(pageData.pageName);
  const [content, setContent] = useState<PageContent>(pageData.content);
  const [isPublished, setIsPublished] = useState(pageData.published || false);
  const [pageBackgroundColor, setPageBackgroundColor] = useState(pageData.pageBackgroundColor || '#FFFFFF');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };
  
  const findComponent = (components: PageComponent[], id: string): { component: PageComponent | null, parent: PageComponent[] | null, index: number } => {
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.id === id) return { component, parent: components, index: i };
        if (component.children) {
            const found = findComponent(component.children, id);
            if (found.component) return found;
        }
    }
    return { component: null, parent: null, index: -1 };
  };

  const selectedComponent = selectedComponentId ? findComponent(content, selectedComponentId).component : null;

  const updateComponentProps = (id: string, newProps: any) => {
    const newContent = JSON.parse(JSON.stringify(content));
    
    const updateRecursively = (components: PageComponent[]) => {
      for (let i = 0; i < components.length; i++) {
        if (components[i].id === id) {
          components[i].props = { ...components[i].props, ...newProps };
          return true;
        }
        if (components[i].children) {
          if (updateRecursively(components[i].children as PageComponent[])) return true;
        }
      }
      return false;
    }
    
    updateRecursively(newContent);
    setContent(newContent);
    setIsDirty(true);
  };

  const deleteComponent = (id: string) => {
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
    const deleteRecursively = (components: PageComponent[]): PageComponent[] => {
        return components.filter(component => {
            if (component.id === id) return false;
            if (component.children) {
                component.children = deleteRecursively(component.children);
            }
            return true;
        });
    };
    setContent(prev => deleteRecursively(JSON.parse(JSON.stringify(prev))));
    setIsDirty(true);
  };

  const handleAddComponent = (type: ComponentType, parentId: string | null, targetId: string | null = null, position: 'top' | 'bottom' = 'top') => {
    const newComponent = createNewComponent(type);
    
    const addRecursively = (items: PageComponent[]): PageComponent[] => {
      // Add to root level
      if (parentId === null) {
        if (targetId === null) { // Add to end of root
          return [...items, newComponent];
        }
        // Add before or after a specific root component
        const targetIndex = items.findIndex(item => item.id === targetId);
        if (targetIndex !== -1) {
            const newItems = [...items];
            newItems.splice(targetIndex + (position === 'bottom' ? 1 : 0), 0, newComponent);
            return newItems;
        }
        return [...items, newComponent]; // Fallback to adding at the end
      }

      // Add to a nested level (i.e., inside a Section)
      return items.map(item => {
        if (item.id === parentId && item.children) {
          const newChildren = [...item.children];
          if (targetId === null) { // Add to end of section
            newChildren.push(newComponent);
          } else { // Add before or after specific component in section
            const targetIndex = newChildren.findIndex(child => child.id === targetId);
            if (targetIndex !== -1) {
                newChildren.splice(targetIndex + (position === 'bottom' ? 1 : 0), 0, newComponent);
            } else {
                newChildren.push(newComponent); // Fallback to adding at the end
            }
          }
          return { ...item, children: newChildren };
        } else if (item.children) {
          return { ...item, children: addRecursively(item.children) };
        }
        return item;
      });
    };

    setContent(prev => addRecursively(JSON.parse(JSON.stringify(prev))));
    setSelectedComponentId(newComponent.id);
    setIsDirty(true);
  };

  const handleMoveComponent = (draggedId: string, targetId: string, parentId: string | null, position: 'top' | 'bottom') => {
    if (draggedId === targetId) return;

    let componentToMove: PageComponent | null = null;
  
    // Function to recursively find and remove a component
    const removeComponent = (items: PageComponent[], id: string): PageComponent[] => {
      return items.filter(item => {
        if (item.id === id) {
          componentToMove = item;
          return false; // Exclude the item
        }
        if (item.children) {
          item.children = removeComponent(item.children, id);
        }
        return true;
      });
    };

    const contentAfterRemoval = removeComponent(JSON.parse(JSON.stringify(content)), draggedId);
    if (!componentToMove) return;

    const insertComponent = (items: PageComponent[]) => {
      if (parentId) { // Dropped inside a section
        return items.map(item => {
          if (item.id === parentId && item.children) {
            const newChildren = [...item.children];
            const targetIndex = newChildren.findIndex(c => c.id === targetId);
            if (targetIndex !== -1) {
              newChildren.splice(targetIndex + (position === 'bottom' ? 1: 0), 0, componentToMove!);
            } else {
              newChildren.push(componentToMove!); // Append if target not found (e.g., dropped on section itself)
            }
            return { ...item, children: newChildren };
          } else if (item.children) {
            return { ...item, children: insertComponent(item.children) };
          }
          return item;
        });
      } else { // Dropped on root
          const newItems = [...items];
          const targetIndex = newItems.findIndex(c => c.id === targetId);
          if (targetIndex !== -1) {
            newItems.splice(targetIndex + (position === 'bottom' ? 1: 0), 0, componentToMove!);
            return newItems;
          }
          return newItems; // Should not happen if targetId is always valid
      }
    };
    
    setContent(insertComponent(contentAfterRemoval));
    setIsDirty(true);
  };


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pageRef = doc(db, 'pages', pageData.id);
      await updateDoc(pageRef, {
        pageName,
        content: JSON.parse(JSON.stringify(content)),
        lastUpdated: serverTimestamp(),
        pageBackgroundColor,
      });
      toast({
        title: 'Page Saved Successfully!',
        description: 'Your changes have been saved.',
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async (published: boolean) => {
    setIsSaving(true);
    try {
      const pageRef = doc(db, 'pages', pageData.id);
      await updateDoc(pageRef, {
        published,
        lastUpdated: serverTimestamp(),
      });
      setIsPublished(published);
      toast({
        title: `Page ${published ? 'Published' : 'Unpublished'}`,
        description: `Your page is now ${published ? 'live' : 'private'}.`,
      });
    } catch (error) {
        console.error('Error updating publish status:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update publish status. Please try again.',
        });
    } finally {
      setIsSaving(false);
    }
  }

  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    // This now runs only on the client, after the component has mounted
    if (pageData.projectId) {
      setPublicUrl(`https://${pageData.projectId}.web.app/p/${pageData.id}`);
    } else {
        // Fallback for when projectId is not available
        setPublicUrl(`${window.location.origin}/p/${pageData.id}`);
    }
  }, [pageData.id, pageData.projectId]);


  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-muted">
        <header className="flex items-center justify-between h-16 px-4 border-b bg-background z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <input 
              type="text" 
              value={pageName} 
              onChange={(e) => {
                setPageName(e.target.value)
                setIsDirty(true)
              }}
              className="font-semibold text-lg bg-transparent border-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger>
                <div className="relative">
                  {isDirty && <Dot className="absolute -top-3 -right-3 h-8 w-8 text-primary animate-pulse" />}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have unsaved changes</p>
              </TooltipContent>
            </Tooltip>

            {isPublished && publicUrl && (
                 <Button variant="outline" size="sm" asChild>
                    <Link href={publicUrl} target="_blank">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        View Live
                    </Link>
                </Button>
            )}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                        <Globe className="mr-2 h-4 w-4" />
                        Publish
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Publish Settings</AlertDialogTitle>
                    <AlertDialogDescription>
                        Publishing your page makes it accessible to anyone with the public URL. 
                        You can unpublish it at any time.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center space-x-2 my-4">
                        <Switch id="publish-toggle" checked={isPublished} onCheckedChange={handlePublishToggle} disabled={isSaving} />
                        <Label htmlFor="publish-toggle">{isPublished ? 'Published' : 'Not Published'}</Label>
                    </div>
                    {isPublished && publicUrl && (
                        <div className="space-y-2">
                           <Label>Public URL</Label>
                           <div className="flex items-center gap-2">
                            <input readOnly value={publicUrl} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            <Button variant="outline" size="sm" onClick={() => {
                                navigator.clipboard.writeText(publicUrl);
                                toast({ title: 'Copied to clipboard!' });
                            }}>Copy</Button>
                           </div>
                        </div>
                    )}
                    <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Button onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </header>
        <div className="flex-grow flex overflow-hidden">
          <aside className="w-80 bg-background border-r flex-shrink-0 basis-80 overflow-y-auto flex flex-col">
            <ComponentPalette />
            <Separator />
            <div className="flex-grow">
              <InspectorPanel
                selectedComponent={selectedComponent}
                onUpdateComponent={updateComponentProps}
                onClearSelection={() => handleSelectComponent(null)}
                pageBackgroundColor={pageBackgroundColor}
                onUpdatePageBackgroundColor={(color) => {
                  setPageBackgroundColor(color);
                  setIsDirty(true);
                }}
              />
            </div>
          </aside>
          <main className="flex-grow overflow-auto">
            <Canvas
              content={content}
              onSelectComponent={handleSelectComponent}
              selectedComponentId={selectedComponentId}
              onDeleteComponent={deleteComponent}
              onAddComponent={handleAddComponent}
              onMoveComponent={handleMoveComponent}
              pageBackgroundColor={pageBackgroundColor}
            />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
