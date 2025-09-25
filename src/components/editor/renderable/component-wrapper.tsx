
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

  const getParentInfo = (element: HTMLElement | null): {parentId: string | null, columnIndex: number | undefined} => {
    if (!element) return { parentId: null, columnIndex: undefined };
    
    const columnElement = element.closest('[data-column-index]');
    if (columnElement) {
        const columnIndex = parseInt(columnElement.getAttribute('data-column-index')!, 10);
        const parentId = columnElement.getAttribute('data-parent-id');
        return { parentId, columnIndex };
    }

    const sectionElement = element.closest('[data-component-type="Section"]');
    if (sectionElement) {
        const parentId = sectionElement.getAttribute('data-component-id');
        return { parentId, columnIndex: undefined };
    }
    
    return { parentId: null, columnIndex: undefined };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'top' : 'bottom';
    setDropPosition(position);

    const isContainer = type === 'Section' || type === 'Columns';
    if (isContainer) {
      // If dragging over a container, decide whether to drop inside or outside based on proximity to edge.
      const edgeThreshold = 20; // 20px from top or bottom edge
      if (e.clientY < rect.top + edgeThreshold) {
        setDropPosition('top');
      } else if (e.clientY > rect.bottom - edgeThreshold) {
        setDropPosition('bottom');
      } else {
        // Drop is inside the container, not above or below it.
        // We'll reset the drop position and show a different visual indicator.
        setDropPosition(null);
      }
    } else {
      setDropPosition(position);
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
      const { parentId, columnIndex } = getParentInfo(e.currentTarget as HTMLElement);
      
      const isContainer = type === 'Section' || type === 'Columns';
      
      // If dropPosition is null, it means we're dropping *inside* a container
      const dropInsideContainer = isContainer && dropPosition === null;

      let targetId = dropInsideContainer ? null : id;
      let effectiveParentId = dropInsideContainer ? id : parentId;
      let effectiveColumnIndex = columnIndex;
      let effectiveDropPosition = dropPosition || 'bottom';

      if (data.type === 'new-component') {
        onAddComponent(data.componentType, effectiveParentId, targetId, effectiveDropPosition, effectiveColumnIndex);
      } else if (data.type === 'move-component') {
        const draggedId = data.componentId;
        onMoveComponent(draggedId, targetId, effectiveParentId, effectiveDropPosition, effectiveColumnIndex);
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
        { 'bg-primary/10': isDraggedOver && (type === 'Section' || type === 'Columns') && dropPosition === null }
      )}
      data-component-id={id}
      data-component-type={type}
    >
      {isDraggedOver && dropPosition && (
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
      <div className={cn({ 'opacity-50': isDraggedOver && dropPosition !== null })}>
        {children}
      </div>
    </div>
  );
}
