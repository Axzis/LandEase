
'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import React, { useState } from 'react';
import { PageComponent, ComponentType } from '@/lib/types';

interface ComponentWrapperProps {
  children: React.ReactNode;
  component: PageComponent;
  path: string;
  isSelected: boolean;
  onSelect: (id: string, path: string) => void;
  onDelete: (id: string) => void;
  onAddComponent: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
  onMoveComponent: (draggedId: string, targetId: string | null, parentId: string | null, position: 'top' | 'bottom', columnIndex?: number) => void;
}

export function ComponentWrapper({
  children,
  component,
  path,
  isSelected,
  onSelect,
  onDelete,
  onAddComponent,
  onMoveComponent,
}: ComponentWrapperProps) {
  const { id, type } = component;
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id, path);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const data = JSON.stringify({
      type: 'move-component',
      componentId: id,
      path: path
    });
    e.dataTransfer.setData('text/plain', data);
  };

  const getParentInfo = (element: HTMLElement | null): { parentId: string | null, columnIndex?: number } => {
    if (!element) return { parentId: null };
  
    // Start from the parent of the current wrapper to find the *actual* parent wrapper
    const parentWrapper = element.parentElement?.closest('[data-component-id]');
    
    if (parentWrapper) {
      const parentId = parentWrapper.getAttribute('data-component-id');
      const parentType = parentWrapper.getAttribute('data-component-type');
  
      if (parentType === 'Columns') {
        const columnEl = element.closest('[data-column-index]');
        if (columnEl) {
          const colIndexStr = columnEl.getAttribute('data-column-index');
          const columnIndex = colIndexStr ? parseInt(colIndexStr, 10) : undefined;
          return { parentId, columnIndex };
        }
      }
      return { parentId };
    }
    
    return { parentId: null };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const isContainer = type === 'Section' || type === 'Columns';
    
    // Make the top drop zone smaller to make dropping 'below' the default behavior.
    const topThreshold = rect.height * 0.25; 

    if (e.clientY < rect.top + topThreshold) {
      setDropPosition('top');
    } else if (isContainer) {
      // For containers, anything that isn't the top edge allows dropping inside.
      setDropPosition(null);
    } else {
      // For non-containers, the rest of the component is a 'bottom' drop zone.
      setDropPosition('bottom');
    }
    
    setIsDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDraggedOver(false);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      const isContainer = type === 'Section' || type === 'Columns';
      const dropInsideContainer = isContainer && dropPosition === null;

      let finalParentId: string | null;
      let finalTargetId: string | null;
      let finalPosition: 'top' | 'bottom';
      let finalColumnIndex: number | undefined;

      if (dropInsideContainer) {
        finalParentId = id; // The container itself is the parent
        finalTargetId = null; // No specific target, append to the container
        finalPosition = 'bottom';
        
        const columnEl = (e.target as HTMLElement).closest('[data-column-index]');
        if (columnEl) {
            const colIndexStr = columnEl.getAttribute('data-column-index');
            finalColumnIndex = colIndexStr ? parseInt(colIndexStr, 10) : undefined;
        } else {
            finalColumnIndex = 0; // Default to first column if not specified
        }

      } else {
        // Dropping above or below another component
        const parentInfo = getParentInfo(e.currentTarget as HTMLElement);
        finalParentId = parentInfo.parentId;
        finalTargetId = id;
        finalPosition = dropPosition || 'bottom'; // Default to bottom if somehow null
        finalColumnIndex = parentInfo.columnIndex;
      }
      
      if (data.type === 'new-component') {
        onAddComponent(data.componentType, finalParentId, finalTargetId, finalPosition, finalColumnIndex);
      } else if (data.type === 'move-component') {
        const draggedId = data.componentId;
        if (draggedId === finalTargetId && finalParentId === getParentInfo(e.currentTarget as HTMLElement).parentId) return;
        
        onMoveComponent(draggedId, finalTargetId, finalParentId, finalPosition, finalColumnIndex);
      }

    } catch (err) {
        console.error("Invalid drop data", err);
    } finally {
        setIsDraggedOver(false);
        setDropPosition(null);
    }
  };

  return (
    <div
      onClick={handleSelect}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable="true"
      className={cn(
        'relative p-1 my-1 transition-all duration-200 group',
        { 'ring-2 ring-primary ring-offset-2 rounded-md': isSelected },
        { 'hover:ring-2 hover:ring-primary/50 rounded-md': !isSelected },
        { 'bg-primary/10': isDraggedOver && (type === 'Section' || type === 'Columns') && dropPosition === null }
      )}
      data-component-id={id}
      data-component-type={type}
      data-path={path}
    >
      {isDraggedOver && dropPosition && (
         <div className={cn(
            'absolute left-0 right-0 h-2 bg-primary z-20 pointer-events-none rounded-full',
            dropPosition === 'top' ? '-top-1' : '-bottom-1'
          )}></div>
      )}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center bg-primary text-primary-foreground p-1 rounded-md shadow-lg z-10 cursor-default" onClick={e => e.stopPropagation()}>
           <span className="text-xs font-semibold px-2">{type}</span>
          <div className="cursor-grab" onDragStart={handleDragStart} draggable>
            <GripVertical className="w-4 h-4 text-primary-foreground hover:bg-primary/80" />
          </div>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="h-6 w-6 text-primary-foreground hover:bg-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className={cn({ 'opacity-50': isDraggedOver && dropPosition !== null })}>
        {children}
      </div>
    </div>
  );
}
