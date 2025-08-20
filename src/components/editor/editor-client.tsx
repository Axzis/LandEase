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

interface EditorClientProps {
  pageData: {
    id: string;
    pageName: string;
    content: PageContent;
    published?: boolean;
    // Add this to get the project ID
    projectId?: string;
  };
}

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createNewComponent = (type: ComponentType): PageComponent => {
  const id = generateId();
  switch (type) {
    case 'Section':
      return { id, type: 'Section', props: { backgroundColor: '#FFFFFF', padding: '64px' }, children: [] };
    case 'Heading':
      return { id, type: 'Heading', props: { text: 'New Heading', level: 'h2', align: 'left' } };
    case 'Text':
      return { id, type: 'Text', props: { text: 'This is a new text block. Click to edit.', align: 'left' } };
    case 'Button':
      return { id, type: 'Button', props: { text: 'Click Me', href: '#', align: 'left' } };
    case 'Image':
      return { id, type: 'Image', props: { src: 'https://placehold.co/600x400', alt: 'Placeholder image' } };
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
};


export function EditorClient({ pageData }: EditorClientProps) {
  const [pageName, setPageName] = useState(pageData.pageName);
  const [content, setContent] = useState<PageContent>(pageData.content);
  const [isPublished, setIsPublished] = useState(pageData.published || false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };
  
  const findComponent = (components: PageComponent[], id: string): PageComponent | null => {
    for (const component of components) {
        if (component.id === id) return component;
        if (component.children) {
            const found = findComponent(component.children, id);
            if (found) return found;
        }
    }
    return null;
  };

  const selectedComponent = selectedComponentId ? findComponent(content, selectedComponentId) : null;

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

  const handleAddComponent = (type: ComponentType, parentId: string | null, targetId: string | null = null) => {
    const newComponent = createNewComponent(type);
    
    const addRecursively = (items: PageComponent[]): PageComponent[] => {
      // Add to root level
      if (parentId === null) {
        if (targetId === null) { // Add to end of root
          return [...items, newComponent];
        }
        // Add before a specific root component
        const newItems = [];
        for (const item of items) {
          if (item.id === targetId) newItems.push(newComponent);
          newItems.push(item);
        }
        return newItems;
      }

      // Add to a nested level (i.e., inside a Section)
      return items.map(item => {
        if (item.id === parentId && item.children) {
          let newChildren = [...item.children];
          if (targetId === null) { // Add to end of section
            newChildren.push(newComponent);
          } else { // Add before specific component in section
            const newChildrenWithTarget = [];
            for (const child of newChildren) {
              if (child.id === targetId) newChildrenWithTarget.push(newComponent);
              newChildrenWithTarget.push(child);
            }
            newChildren = newChildrenWithTarget;
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

  const handleMoveComponent = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    let componentToMove: PageComponent | null = null;
    let contentAfterRemoval: PageComponent[] = [];
  
    function removeComponent(items: PageComponent[], id: string): PageComponent[] {
      return items.reduce((acc, item) => {
        if (item.id === id) {
          componentToMove = item;
          return acc;
        }
        if (item.children) {
          item.children = removeComponent(item.children, id);
        }
        acc.push(item);
        return acc;
      }, [] as PageComponent[]);
    }
  
    contentAfterRemoval = removeComponent(JSON.parse(JSON.stringify(content)), draggedId);
  
    if (!componentToMove) return;
  
    function insertComponent(items: PageComponent[], tId: string): PageComponent[] {
      // Special case: Dropping on a section adds to its children
      const targetSection = items.find(item => item.id === tId && item.type === 'Section');
      if (targetSection && targetSection.children) {
        targetSection.children.push(componentToMove!);
        return items;
      }
      
      // Otherwise, insert before the target component
      return items.reduce((acc, item) => {
        if (item.id === tId) {
          acc.push(componentToMove!);
        }
        if (item.children) {
          item.children = insertComponent(item.children, tId);
        }
        acc.push(item);
        return acc;
      }, [] as PageComponent[]);
    }
    
    const newContent = insertComponent(contentAfterRemoval, targetId);
    
    setContent(newContent);
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
            />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
