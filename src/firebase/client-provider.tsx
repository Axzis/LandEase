'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AuthProvider } from '@/firebase/auth/use-user';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Configuration is now directly managed here.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Simplified and robust initialization function.
function initializeFirebase(): FirebaseServices | null {
  // If config is missing, we can't initialize Firebase.
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase config is missing. Make sure NEXT_PUBLIC_FIREBASE variables are set in .env");
    return null;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures Firebase is initialized only once per client session.
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  if (!firebaseServices) {
     return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-destructive mb-2">Firebase Not Configured</h2>
            <p className="text-muted-foreground">
                Firebase environment variables (NEXT_PUBLIC_FIREBASE_*) are not set.
                Please check your .env file and restart the server.
            </p>
        </div>
      </div>
    );
  }

  // The providers are now correctly nested.
  // FirebaseProvider makes the SDK instances available.
  // AuthProvider uses those instances to manage user state.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthProvider>
        {children}
        <FirebaseErrorListener />
      </AuthProvider>
    </FirebaseProvider>
  );
}
