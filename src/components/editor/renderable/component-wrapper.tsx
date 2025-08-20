'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import React, { useState } from 'react';
import { PageComponent, ComponentType } from '@/lib/types';

interface ComponentWrapperProps {
  children: React.ReactNode;
  component: PageComponent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddComponent: (type: ComponentType, parentId: string | null, targetId: string | null) => void;
  onMoveComponent: (draggedId: string, targetId: string) => void;
}

export function ComponentWrapper({
  children,
  component,
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
    onSelect(id);
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
    });
    e.dataTransfer.setData('text/plain', data);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(true);
    
    // For non-section components, determine if dropping above or below
    if (type !== 'Section') {
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midpoint ? 'top' : 'bottom');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDraggedOver(false);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(false);
    setDropPosition(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      const dropTargetId = (type === 'Section' && dropPosition === null) ? id : id;
      
      if (data.type === 'new-component') {
        const parentId = type === 'Section' ? id : null;
        // If dropping on a section, targetId is null (append). If dropping on another component, it is the component's id (insert before).
        const targetIdForNew = type === 'Section' ? null : id;
        onAddComponent(data.componentType, parentId, targetIdForNew);
      } else if (data.type === 'move-component') {
        onMoveComponent(data.componentId, dropTargetId);
      }
    } catch (err) {
        console.error("Invalid drop data", err);
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
        isSelected && 'ring-2 ring-primary ring-offset-2 rounded-md',
        !isSelected && 'hover:ring-2 hover:ring-primary/50 rounded-md',
        isDraggedOver && type === 'Section' && 'outline-dashed outline-2 outline-primary outline-offset-2'
      )}
    >
      {isDraggedOver && type !== 'Section' && (
         <div className={cn(
            'absolute left-0 right-0 h-1 bg-primary z-20 pointer-events-none',
            dropPosition === 'top' ? '-top-1' : '-bottom-1'
          )}></div>
      )}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center bg-primary text-primary-foreground p-1 rounded-md shadow-lg z-10 cursor-default" onClick={e => e.stopPropagation()} onDragStart={e => e.stopPropagation()}>
           <span className="text-xs font-semibold px-2">{type}</span>
          <div className="cursor-grab" onDragStart={handleDragStart} draggable>
            <GripVertical className="w-4 h-4 text-primary-foreground hover:bg-primary/80" />
          </div>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="h-6 w-6 text-primary-foreground hover:bg-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className={cn(isDraggedOver && 'opacity-50')}>
        {children}
      </div>
    </div>
  );
}
