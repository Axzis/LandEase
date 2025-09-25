'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc, serverTimestamp, addDoc, collection, writeBatch } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createDefaultPageContent } from '@/lib/utils';
import { FirebaseError } from 'firebase/app';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  name: z.string().optional(),
});

type AuthFormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Firebase not initialized.' });
      setIsLoading(false);
      return;
    }
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: values.name });
        
        const batch = writeBatch(firestore);

        const userDocRef = doc(firestore, "users", user.uid);
        const userDocData = {
          uid: user.uid,
          email: user.email,
          displayName: values.name,
          createdAt: serverTimestamp(),
        };
        batch.set(userDocRef, userDocData);
        
        const newPageRef = doc(collection(firestore, 'pages'));
        const defaultPageData = {
            userId: user.uid,
            pageName: 'My First Page',
            content: createDefaultPageContent(),
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            published: false,
        };
        batch.set(newPageRef, defaultPageData);

        const userPageLinkRef = doc(collection(firestore, `user_pages/${user.uid}/pages`));
        batch.set(userPageLinkRef, { pageId: newPageRef.id, pageName: 'My First Page' });
        
        await batch.commit().catch(error => {
           toast({ variant: 'destructive', title: 'Error during signup process', description: 'Failed to create initial user data.'});
           console.error("Signup batch commit failed", error);
        });
        
        toast({ title: "Account created successfully!" });
        router.push('/dashboard');

      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: "Signed in successfully!" });
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === 'signup' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
