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
  onAddComponent: (type: ComponentType, parentId: string | null, targetId: string | null, position: 'top' | 'bottom') => void;
  onMoveComponent: (draggedId: string, targetId: string, parentId: string | null, position: 'top' | 'bottom') => void;
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(true);

    if (type === 'Section') {
      setDropPosition(null); // No top/bottom indicator for sections
    } else {
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
      const parentId = type === 'Section' ? id : null;

      if (data.type === 'new-component') {
        const targetIdForNew = type === 'Section' ? null : id;
        const positionForNew = dropPosition || 'top';
        onAddComponent(data.componentType, parentId, targetIdForNew, positionForNew);
      } else if (data.type === 'move-component') {
        const draggedId = data.componentId;
        const targetIdForMove = id;
        const positionForMove = dropPosition || 'top';
        onMoveComponent(draggedId, targetIdForMove, parentId, positionForMove);
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
        { 'ring-2 ring-primary ring-offset-2 rounded-md': isSelected },
        { 'hover:ring-2 hover:ring-primary/50 rounded-md': !isSelected },
        { 'bg-primary/10': isDraggedOver && type === 'Section' }
      )}
      data-component-id={id}
      data-component-type={type}
    >
      {isDraggedOver && type !== 'Section' && (
         <div className={cn(
            'absolute left-0 right-0 h-1 bg-primary z-20 pointer-events-none',
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
      <div className={cn(isDraggedOver && 'opacity-50')}>
        {children}
      </div>
    </div>
  );
}
