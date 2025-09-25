'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button as UIButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/lib/types';

interface PublicFormProps {
    pageId: string;
    pageName: string;
    title: string;
    description: string;
    buttonText: string;
    fields: FormField[];
}

export const PublicForm = ({ pageId, pageName, ...props }: PublicFormProps) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const initialFormState = props.fields.reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
    }, {} as Record<string, string>);
    
    const [formData, setFormData] = useState(initialFormState);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot submit form. Page information is missing.' });
            return;
        }
        
        setIsLoading(true);

        try {
            await addDoc(collection(firestore, `submissions`), { // Changed: submissions at root
                pageId: pageId,
                pageName: pageName,
                formData: formData,
                submittedAt: serverTimestamp(),
            });
            toast({ title: 'Success!', description: 'Your submission has been received.'});
            setFormData(initialFormState); // Reset form
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not submit your response. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderField = (field: FormField) => {
        const commonProps = {
            id: field.id,
            name: field.name,
            placeholder: field.placeholder,
            value: formData[field.name],
            onChange: handleInputChange,
            required: field.required,
            className: "bg-background",
        };

        if (field.type === 'textarea') {
            return <Textarea {...commonProps} />;
        }
        return <Input type={field.type} {...commonProps} />;
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-card p-8 rounded-lg shadow-md border">
            <h3 className="text-2xl font-bold mb-2 text-card-foreground">{props.title}</h3>
            <p className="text-muted-foreground mb-6">{props.description}</p>
            <div className="space-y-4">
                {(props.fields || []).map(field => (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-card-foreground">{field.label}</Label>
                        {renderField(field)}
                    </div>
                ))}
                <UIButton type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {props.buttonText}
                </UIButton>
            </div>
        </form>
    )
}