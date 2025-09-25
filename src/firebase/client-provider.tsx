'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AuthProvider, FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!firebaseServices) {
     return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {/* FirebaseErrorListener needs to be inside FirebaseProvider but outside AuthProvider */}
      {/* to catch errors even when auth state is loading. */}
      <FirebaseErrorListener />
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}
