'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  pageName: z.string().min(1, { message: 'Page name is required.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePageDialogProps {
  children: React.ReactNode;
  onCreatePage: (pageName: string) => Promise<void>;
  isCreating: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CreatePageDialog({
  children,
  onCreatePage,
  isCreating,
  isOpen,
  setIsOpen,
}: CreatePageDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageName: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onCreatePage(values.pageName);
  };

  // Reset form when dialog opens/closes to clear validation
  React.useEffect(() => {
    form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Give your new page a name to get started. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="pageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'My Awesome Product'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Page
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
