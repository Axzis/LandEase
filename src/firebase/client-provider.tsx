'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AuthProvider } from '@/firebase/auth/use-user';
import { FirebaseProvider } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

import { firebaseConfig } from '@/firebase/client-config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// This function should now only be called on the client.
function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    // Return null if the config is not valid.
    return null;
  }
  if (getApps().length) {
    return getSdks(getApp());
  }
  
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}


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
        <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Firebase Not Configured</h2>
            <p className="text-muted-foreground">
                Firebase environment variables are not set. Please configure them to use the app.
            </p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
      <FirebaseErrorListener />
    </FirebaseProvider>
  );
}
