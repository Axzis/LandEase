
'use client';

import { NavbarComponent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '../image-uploader';

interface NavbarInspectorProps {
  component: NavbarComponent;
  onUpdate: (id: string, newProps: Partial<NavbarComponent['props']>) => void;
}

export function NavbarInspector({ component, onUpdate }: NavbarInspectorProps) {
  const { id, props } = component;
  const { backgroundColor, logoText, logoImageUrl, links = [] } = props;

  const handleLinkChange = (index: number, field: 'text' | 'href', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onUpdate(id, { links: newLinks });
  };

  const handleAddLink = () => {
    const newLinks = [...links, { text: 'New Link', href: '#' }];
    onUpdate(id, { links: newLinks });
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onUpdate(id, { links: newLinks });
  };


  return (
    <BaseInspector title="Navbar">
      <div className="space-y-2">
        <Label htmlFor={`backgroundColor-${id}`}>Background Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            id={`backgroundColor-picker-${id}`}
            value={backgroundColor}
            onChange={(e) => onUpdate(id, { backgroundColor: e.target.value })}
            className="p-1 h-10 w-10"
          />
          <Input
            id={`backgroundColor-${id}`}
            value={backgroundColor}
            onChange={(e) => onUpdate(id, { backgroundColor: e.target.value })}
          />
        </div>
      </div>
      
      <Separator />

      <div className="space-y-2">
        <Label htmlFor={`logoText-${id}`}>Logo Text</Label>
        <Input
          id={`logoText-${id}`}
          value={logoText}
          onChange={(e) => onUpdate(id, { logoText: e.target.value })}
        />
      </div>

       <div className="space-y-2">
        <Label htmlFor={`logoImageUrl-${id}`}>Logo Image (optional)</Label>
        <ImageUploader 
            value={logoImageUrl}
            onChange={(newUrl) => onUpdate(id, { logoImageUrl: newUrl })}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Navigation Links</Label>
        {links.map((link, index) => (
          <div key={index} className="p-3 border rounded-lg space-y-2 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleRemoveLink(index)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
            <div className="space-y-1">
              <Label htmlFor={`link-text-${id}-${index}`} className="text-xs">Text</Label>
              <Input
                id={`link-text-${id}-${index}`}
                value={link.text}
                onChange={(e) => handleLinkChange(index, 'text', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`link-href-${id}-${index}`} className="text-xs">URL</Label>
              <Input
                id={`link-href-${id}-${index}`}
                value={link.href}
                onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
              />
            </div>
          </div>
        ))}
         <Button variant="outline" className="w-full" onClick={handleAddLink}>
          <Plus className="mr-2 h-4 w-4" /> Add Link
        </Button>
      </div>

    </BaseInspector>
  );
}
