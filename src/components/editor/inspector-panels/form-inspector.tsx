
'use client';

import { FormComponent, FormField } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseInspector } from './base-inspector';
import { PaddingInspector } from './padding-inspector';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FormInspectorProps {
  component: FormComponent;
  onUpdate: (id: string, newProps: Partial<FormComponent['props']>) => void;
}

const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export function FormInspector({ component, onUpdate }: FormInspectorProps) {
  const { id, props } = component;
  const { title, description, buttonText, fields = [] } = props;

  const handleFieldChange = (index: number, fieldProp: keyof FormField, value: string | boolean) => {
    const newFields = [...fields];
    const fieldToUpdate = { ...newFields[index] };
    (fieldToUpdate[fieldProp] as any) = value;

    // Auto-generate name from label if name is empty
    if (fieldProp === 'label' && !fieldToUpdate.name) {
        fieldToUpdate.name = (value as string).toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    }

    newFields[index] = fieldToUpdate;
    onUpdate(id, { fields: newFields });
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: generateFieldId(),
      label: 'New Field',
      name: 'new_field',
      type: 'text',
      placeholder: '',
      required: false,
    };
    onUpdate(id, { fields: [...fields, newField] });
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onUpdate(id, { fields: newFields });
  };


  return (
    <BaseInspector title="Form">
      <div className="space-y-2">
        <Label htmlFor={`title-${id}`}>Form Title</Label>
        <Input
          id={`title-${id}`}
          value={title}
          onChange={(e) => onUpdate(id, { title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`description-${id}`}>Description</Label>
        <Textarea
          id={`description-${id}`}
          value={description}
          onChange={(e) => onUpdate(id, { description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`buttonText-${id}`}>Button Text</Label>
        <Input
          id={`buttonText-${id}`}
          value={buttonText}
          onChange={(e) => onUpdate(id, { buttonText: e.target.value })}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Form Fields</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 border rounded-lg space-y-3 relative">
            <div className='flex justify-between items-center'>
                <p className='text-sm font-medium'>Field {index + 1}</p>
                <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleRemoveField(index)}
                >
                <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`field-label-${field.id}`} className="text-xs">Label</Label>
              <Input
                id={`field-label-${field.id}`}
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`field-name-${field.id}`} className="text-xs">Name (for submission data)</Label>
              <Input
                id={`field-name-${field.id}`}
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                placeholder="e.g., user_name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`field-type-${field.id}`} className="text-xs">Type</Label>
               <Select value={field.type} onValueChange={(value) => handleFieldChange(index, 'type', value)}>
                <SelectTrigger id={`field-type-${field.id}`}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="textarea">Text Area</SelectItem>
                </SelectContent>
                </Select>
            </div>
             <div className="space-y-1">
              <Label htmlFor={`field-placeholder-${field.id}`} className="text-xs">Placeholder</Label>
              <Input
                id={`field-placeholder-${field.id}`}
                value={field.placeholder}
                onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={`field-required-${field.id}`}
                    checked={field.required}
                    onCheckedChange={(checked) => handleFieldChange(index, 'required', !!checked)}
                />
                <Label htmlFor={`field-required-${field.id}`} className="text-xs font-normal">Required</Label>
            </div>
          </div>
        ))}
         <Button variant="outline" className="w-full" onClick={handleAddField}>
          <Plus className="mr-2 h-4 w-4" /> Add Field
        </Button>
      </div>


      <PaddingInspector component={component} onUpdate={onUpdate} />
    </BaseInspector>
  );
}
