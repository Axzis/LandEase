'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import React from 'react';

interface ComponentWrapperProps {
  children: React.ReactNode;
  id: string;
  type: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ComponentWrapper({
  children,
  id,
  type,
  isSelected,
  onSelect,
  onDelete,
}: ComponentWrapperProps) {
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div
      onClick={handleSelect}
      className={cn(
        'relative p-1 my-1 transition-all duration-200',
        isSelected && 'ring-2 ring-primary ring-offset-2 rounded-md',
        'hover:ring-2 hover:ring-primary/50 rounded-md'
      )}
    >
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center bg-primary text-primary-foreground p-1 rounded-md shadow-lg z-10">
           <span className="text-xs font-semibold px-2">{type}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab text-primary-foreground hover:bg-primary/80">
            <GripVertical className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="h-6 w-6 text-primary-foreground hover:bg-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
