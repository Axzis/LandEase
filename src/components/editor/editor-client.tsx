'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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
import { firebaseConfig } from '@/firebase/config';

interface EditorClientProps {
  pageId: string;
}

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createNewComponent = (type: ComponentType): PageComponent => {
  const id = generateId();
  switch (type) {
    case 'Section':
      return { id, type: 'Section', props: { backgroundColor: 'transparent', padding: '16px', display: 'block', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', gap: '16px' }, children: [] };
    case 'Columns':
        return { id, type: 'Columns', props: { numberOfColumns: 2, gap: '16px' }, children: [[], []] };
    case 'Heading':
      return { id, type: 'Heading', props: { text: 'New Heading', level: 'h2', align: 'left', padding: '0px' } };
    case 'Text':
      return { id, type: 'Text', props: { text: 'This is a new text block. Click to edit.', align: 'left', fontFamily: 'Inter', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', padding: '0px' } };
    case 'Button':
      return { id, type: 'Button', props: { text: 'Click Me', href: '#', align: 'left', padding: '0px' } };
    case 'Image':
      return { id, type: 'Image', props: { src: 'https://placehold.co/600x400', alt: 'Placeholder image', width: 600, height: 400, padding: '0px' } };
    case 'Navbar':
      return { id, type: 'Navbar', props: { backgroundColor: '#FFFFFF', logoText: 'LandEase', logoImageUrl: '', links: [{text: 'Home', href: '#'}, {text: 'About', href: '#'}, {text: 'Contact', href: '#'}] } };
    case 'Footer':
      return { id, type: 'Footer', props: { backgroundColor: '#1F2937', copyrightText: `© ${new Date().getFullYear()} Your Company. All rights reserved.` } };
    case 'Video':
      return { id, type: 'Video', props: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', padding: '0px' } };
    case 'Form':
      return { id, type: 'Form', props: { title: 'Contact Us', description: 'Fill out the form below and we will get back to you.', buttonText: 'Submit', padding: '16px' } };
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
};


export function EditorClient({ pageId }: EditorClientProps) {
  const firestore = useFirestore();
  const pageDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'pages', pageId) : null, [firestore, pageId]);
  const { data: pageData, isLoading: isPageLoading, error: pageError } = useDoc(pageDocRef);

  const [pageName, setPageName] = useState('');
  const [content, setContent] = useState<PageContent>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [pageBackgroundColor, setPageBackgroundColor] = useState('#FFFFFF');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    if (pageData) {
      setPageName(pageData.pageName || '');
      setContent(pageData.content || []);
      setIsPublished(pageData.published || false);
      setPageBackgroundColor(pageData.pageBackgroundColor || '#FFFFFF');
    }
  }, [pageData]);


  // Keyboard shortcut for deleting component
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        // Prevent browser back navigation on Backspace
        if (e.key === 'Backspace' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
        
        if (selectedComponentId) {
            // Check if focus is not inside an input field
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }
          deleteComponent(selectedComponentId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId, content]); // Depend on content to get the latest version

  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };
  
  const findComponent = (components: PageContent, id: string): { component: PageComponent | null, parent: PageComponent[] | PageComponent[][] | null, index: number, parentComponent?: PageComponent } => {
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.id === id) return { component, parent: components, index: i };
        
        if (component.children) {
            if (Array.isArray(component.children[0])) { // Columns
                for(let colIndex = 0; colIndex < component.children.length; colIndex++) {
                    const column = component.children[colIndex] as PageComponent[];
                    const found = findComponent(column, id);
                    if (found.component) {
                        return { ...found, parentComponent: component };
                    }
                }
            } else { // Section
                const found = findComponent(component.children as PageComponent[], id);
                if (found.component) {
                    return { ...found, parentComponent: component };
                }
            }
        }
    }
    return { component: null, parent: null, index: -1 };
  };

  const selectedComponent = selectedComponentId ? findComponent(content, selectedComponentId).component : null;

  const updateComponentProps = (id: string, newProps: any) => {
    const newContent = JSON.parse(JSON.stringify(content));
    
    const updateRecursively = (components: PageComponent[]): boolean => {
      for (let i = 0; i < components.length; i++) {
        let component = components[i];
        if (component.id === id) {
          if (component.type === 'Columns' && newProps.numberOfColumns) {
              const currentChildren = component.children || [];
              const newChildrenCount = newProps.numberOfColumns;
              const newChildren = Array.from({ length: newChildrenCount }, (_, i) => currentChildren[i] || []);
              component.children = newChildren;
          }
          components[i].props = { ...components[i].props, ...newProps };
          return true;
        }
        if (component.children) {
          if (component.type === 'Columns') {
            for (const col of component.children) {
              if (updateRecursively(col as PageComponent[])) return true;
            }
          } else {
            if (updateRecursively(component.children as PageComponent[])) return true;
          }
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
    const deleteRecursively = (items: PageComponent[]): PageComponent[] => {
        return items.filter(item => {
            if (item.id === id) return false;
            if (item.children) {
                if (item.type === 'Columns') {
                    item.children = item.children.map(col => deleteRecursively(col as PageComponent[]));
                } else {
                    item.children = deleteRecursively(item.children as PageComponent[]);
                }
            }
            return true;
        });
    };
    setContent(prev => deleteRecursively(JSON.parse(JSON.stringify(prev))));
    setIsDirty(true);
  };

  const handleAddComponent = (type: ComponentType, parentId: string | null, targetId: string | null = null, position: 'top' | 'bottom' = 'top', columnIndex?: number) => {
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

      return items.map(item => {
        if (item.id === parentId) {
            if (item.type === 'Columns' && item.children && columnIndex !== undefined) {
                const newChildren = [...item.children] as PageComponent[][];
                const targetColumn = newChildren[columnIndex] || [];
                const targetIndex = targetColumn.findIndex(child => child.id === targetId);
                
                if (targetId === null) { // dropped on column bg
                    targetColumn.push(newComponent);
                } else if (targetIndex !== -1) {
                    targetColumn.splice(targetIndex + (position === 'bottom' ? 1 : 0), 0, newComponent);
                } else {
                    targetColumn.push(newComponent); // fallback
                }
                newChildren[columnIndex] = targetColumn;
                return { ...item, children: newChildren };
            } else if (item.type === 'Section' && item.children) {
                const newChildren = [...(item.children as PageComponent[])];
                if (targetId === null) {
                    newChildren.push(newComponent);
                } else {
                    const targetIndex = newChildren.findIndex(child => child.id === targetId);
                    if (targetIndex !== -1) {
                        newChildren.splice(targetIndex + (position === 'bottom' ? 1 : 0), 0, newComponent);
                    } else {
                        newChildren.push(newComponent);
                    }
                }
                return { ...item, children: newChildren };
            }
        } else if (item.children) {
            if (item.type === 'Columns') {
                 const newChildren = (item.children as PageComponent[][]).map(col => addRecursively(col));
                 return { ...item, children: newChildren };
            }
            return { ...item, children: addRecursively(item.children as PageComponent[]) };
        }
        return item;
      });
    };

    setContent(prev => addRecursively(JSON.parse(JSON.stringify(prev))));
    setSelectedComponentId(newComponent.id);
    setIsDirty(true);
  };

  const handleMoveComponent = (draggedId: string, targetId: string | null, parentId: string | null, position: 'top' | 'bottom', columnIndex?: number) => {
    if (draggedId === targetId) return;

    let componentToMove: PageComponent | null = null;
  
    const removeComponent = (items: PageComponent[]): PageComponent[] => {
      return items.filter(item => {
        if (item.id === draggedId) {
          componentToMove = item;
          return false;
        }
        if (item.children) {
           if (item.type === 'Columns') {
               item.children = (item.children as PageComponent[][]).map(col => removeComponent(col));
           } else {
               item.children = removeComponent(item.children as PageComponent[]);
           }
        }
        return true;
      });
    };

    const contentAfterRemoval = removeComponent(JSON.parse(JSON.stringify(content)));
    if (!componentToMove) return;

    const insertComponent = (items: PageComponent[]): PageComponent[] => {
      if (parentId) {
        return items.map(item => {
          if (item.id === parentId) {
            if (item.type === 'Columns' && item.children && columnIndex !== undefined) {
                const newChildren = [...(item.children as PageComponent[][])];
                const targetColumn = newChildren[columnIndex] || [];
                if (targetId) {
                    const targetIndex = targetColumn.findIndex(c => c.id === targetId);
                    if (targetIndex !== -1) {
                        targetColumn.splice(targetIndex + (position === 'bottom' ? 1: 0), 0, componentToMove!);
                    } else {
                        targetColumn.push(componentToMove!);
                    }
                } else { // dropped on column bg
                    targetColumn.push(componentToMove!);
                }
                newChildren[columnIndex] = targetColumn;
                return { ...item, children: newChildren };
            } else if (item.type === 'Section' && item.children) {
                const newChildren = [...(item.children as PageComponent[])];
                if (targetId) {
                    const targetIndex = newChildren.findIndex(c => c.id === targetId);
                    if (targetIndex !== -1) {
                        newChildren.splice(targetIndex + (position === 'bottom' ? 1: 0), 0, componentToMove!);
                    } else {
                        newChildren.push(componentToMove!);
                    }
                } else {
                    newChildren.push(componentToMove!);
                }
                return { ...item, children: newChildren };
            }
          } else if (item.children) {
            if (item.type === 'Columns') {
                const newChildren = (item.children as PageComponent[][]).map(col => insertComponent(col));
                return { ...item, children: newChildren };
            }
            return { ...item, children: insertComponent(item.children as PageComponent[]) };
          }
          return item;
        });
      } else { // Dropped on root
          const newItems = [...items];
          if (targetId) {
            const targetIndex = newItems.findIndex(c => c.id === targetId);
            if (targetIndex !== -1) {
                newItems.splice(targetIndex + (position === 'bottom' ? 1: 0), 0, componentToMove!);
            } else {
                newItems.push(componentToMove!); // Fallback
            }
          } else {
            newItems.push(componentToMove!); // Dropped on canvas bg
          }
          return newItems;
      }
    };
    
    setContent(insertComponent(contentAfterRemoval));
    setIsDirty(true);
  };


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pageRef = doc(firestore, 'pages', pageId);
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
      const pageRef = doc(firestore, 'pages', pageId);
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
    setPublicUrl(`${window.location.origin}/p/${pageId}`);
  }, [pageId]);

  if (isPageLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
              <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Page</h2>
              <p className="text-muted-foreground">Could not load page data. You may not have permission to view this page, or it may not exist.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
          </div>
      </div>
    )
  }


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
