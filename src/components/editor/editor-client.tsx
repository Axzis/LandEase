'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { PageContent, PageComponent } from '@/lib/types';
import { ComponentPalette } from './component-palette';
import { Canvas } from './canvas';
import { InspectorPanel } from './inspector-panel';
import { Button } from '../ui/button';
import { Loader2, Save, ArrowLeft, Dot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EditorClientProps {
  pageData: {
    id: string;
    pageName: string;
    content: PageContent;
  };
}

export function EditorClient({ pageData }: EditorClientProps) {
  const [pageName, setPageName] = useState(pageData.pageName);
  const [content, setContent] = useState<PageContent>(pageData.content);
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
    const newContent = JSON.parse(JSON.stringify(content));

    const deleteRecursively = (components: PageComponent[]): PageComponent[] => {
        return components.filter(component => {
            if (component.id === id) return false;
            if (component.children) {
                component.children = deleteRecursively(component.children);
            }
            return true;
        });
    };

    const updatedContent = deleteRecursively(newContent);
    setContent(updatedContent);
    setSelectedComponentId(null);
    setIsDirty(true);
  };


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pageRef = doc(db, 'pages', pageData.id);
      await updateDoc(pageRef, {
        pageName,
        content,
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
          <div className="flex items-center gap-2">
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </header>
        <div className="flex-grow flex overflow-hidden">
          <ComponentPalette />
          <main className="flex-grow flex-shrink-[3] basis-0 overflow-auto">
            <Canvas
              content={content}
              onSelectComponent={handleSelectComponent}
              selectedComponentId={selectedComponentId}
              onDeleteComponent={deleteComponent}
            />
          </main>
          <aside className="w-80 bg-background border-l flex-shrink-0 basis-80 overflow-y-auto">
            <InspectorPanel
              selectedComponent={selectedComponent}
              onUpdateComponent={updateComponentProps}
              onClearSelection={() => handleSelectComponent(null)}
            />
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}
