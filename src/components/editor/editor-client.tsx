
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { PageContent, PageComponent, ComponentType, Column } from '@/lib/types';
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
        const createColumns = (count: number): Column[] => {
            return Array.from({ length: count }, () => ({ id: generateId(), children: [] }));
        }
        return { id, type: 'Columns', props: { numberOfColumns: 2, gap: '16px' }, columns: createColumns(2) };
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
      return { 
        id, 
        type: 'Form', 
        props: { 
          title: 'Contact Us', 
          description: 'Fill out the form below and we will get back to you.', 
          buttonText: 'Submit', 
          padding: '16px',
          fields: [
            { id: 'field_1', name: 'name', label: 'Name', type: 'text', placeholder: 'Your Name', required: true },
            { id: 'field_2', name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
          ]
        } 
      };
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
};


export function EditorClient({ pageId }: EditorClientProps) {
  const firestore = useFirestore();
  const { user, loading: isUserLoading } = useUser();
  const pageDocRef = useMemoFirebase(() => {
    if (!firestore || !pageId) return null;
    return doc(firestore, 'pages', pageId);
  }, [firestore, pageId]);

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
  const [isPending, startTransition] = useTransition();
  
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
  
  const findComponent = (components: PageContent, id: string): { component: PageComponent | null, parent: PageContent | Column[] | null, index: number, parentComponent?: PageComponent } => {
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.id === id) return { component, parent: components, index: i };
        
        if (component.type === 'Columns') {
            for (const column of component.columns) {
                const found = findComponent(column.children, id);
                if (found.component) {
                    return { ...found, parentComponent: component };
                }
            }
        } else if (component.children) {
            const found = findComponent(component.children, id);
            if (found.component) {
                return { ...found, parentComponent: component };
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
              const currentColumns = component.columns || [];
              const newColumnCount = newProps.numberOfColumns;
              const newColumns = Array.from({ length: newColumnCount }, (_, i) => currentColumns[i] || { id: generateId(), children: [] });
              component.columns = newColumns;
          }
          components[i].props = { ...components[i].props, ...newProps };
          return true;
        }

        if (component.type === 'Columns') {
          for (const col of component.columns) {
            if (updateRecursively(col.children)) return true;
          }
        } else if (component.children) {
          if (updateRecursively(component.children)) return true;
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
            if (item.type === 'Columns') {
                item.columns = item.columns.map(col => ({...col, children: deleteRecursively(col.children)}));
            } else if (item.children) {
                item.children = deleteRecursively(item.children);
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
            if (item.type === 'Columns' && columnIndex !== undefined) {
                const newColumns = [...item.columns];
                const targetColumn = newColumns[columnIndex];
                if (targetColumn) {
                    const targetIndex = targetColumn.children.findIndex(child => child.id === targetId);
                    if (targetId === null) { // dropped on column bg
                        targetColumn.children.push(newComponent);
                    } else if (targetIndex !== -1) {
                        targetColumn.children.splice(targetIndex + (position === 'bottom' ? 1 : 0), 0, newComponent);
                    } else {
                        targetColumn.children.push(newComponent); // fallback
                    }
                }
                return { ...item, columns: newColumns };
            } else if (item.children) {
                const newChildren = [...item.children];
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
        } else if (item.type === 'Columns') {
            const newColumns = item.columns.map(col => ({...col, children: addRecursively(col.children)}));
            return {...item, columns: newColumns};
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

  const handleMoveComponent = (draggedId: string, targetId: string | null, parentId: string | null, position: 'top' | 'bottom', columnIndex?: number) => {
    if (draggedId === targetId) return;

    let componentToMove: PageComponent | null = null;
  
    const removeComponent = (items: PageComponent[]): PageComponent[] => {
      return items.filter(item => {
        if (item.id === draggedId) {
          componentToMove = item;
          return false;
        }
        if (item.type === 'Columns') {
           item.columns = item.columns.map(col => ({...col, children: removeComponent(col.children)}));
        } else if (item.children) {
           item.children = removeComponent(item.children);
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
            if (item.type === 'Columns' && columnIndex !== undefined) {
                const newColumns = [...item.columns];
                const targetColumn = newColumns[columnIndex];
                if (targetColumn) {
                    if (targetId) {
                        const targetIndex = targetColumn.children.findIndex(c => c.id === targetId);
                        if (targetIndex !== -1) {
                            targetColumn.children.splice(targetIndex + (position === 'bottom' ? 1: 0), 0, componentToMove!);
                        } else {
                            targetColumn.children.push(componentToMove!);
                        }
                    } else { // dropped on column bg
                        targetColumn.children.push(componentToMove!);
                    }
                }
                return { ...item, columns: newColumns };
            } else if (item.children) {
                const newChildren = [...item.children];
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
          } else if (item.type === 'Columns') {
            const newColumns = item.columns.map(col => ({...col, children: insertComponent(col.children)}));
            return { ...item, columns: newColumns };
          } else if (item.children) {
            return { ...item, children: insertComponent(item.children) };
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


  const handleSave = async (publishedState: boolean) => {
    if (!pageDocRef) return;
    setIsSaving(true);
    
    const dataToSave = {
      userId: user?.uid,
      pageName,
      content: JSON.parse(JSON.stringify(content)),
      lastUpdated: serverTimestamp(),
      pageBackgroundColor,
      published: publishedState,
    };

    try {
      await setDoc(pageDocRef, dataToSave, { merge: true });
      toast({
        title: 'Page Saved!',
        description: 'Your changes have been saved.',
      });
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving page to Firestore: ", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your changes to the database.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handlePublishToggle = (published: boolean) => {
    setIsPublished(published);
    setIsDirty(true);
    // The save action will now handle the `published` state
    startTransition(() => {
        handleSave(published).then(() => {
            toast({
                title: `Page ${published ? 'Published' : 'Unpublished'}`,
                description: `Your page is now ${published ? 'live' : 'private'}.`,
            });
        });
    });
  }

  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/p/${pageId}`);
  }, [pageId]);

  if (isUserLoading || (isPageLoading && pageDocRef)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (pageData && user && pageData.userId !== user.uid) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
              <p className="text-muted-foreground max-w-md mx-auto">You do not have permission to edit this page.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
          </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Page</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Could not load page data. You may not have permission to view this page, or it may have been deleted.</p>
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
                        <Switch id="publish-toggle" checked={isPublished} onCheckedChange={handlePublishToggle} disabled={isSaving || isPending} />
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

            <Button onClick={() => handleSave(isPublished)} disabled={isSaving || !isDirty || isPending}>
              {(isSaving || isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {(isSaving || isPending) ? 'Saving...' : 'Save'}
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
