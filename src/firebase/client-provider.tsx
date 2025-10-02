'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AuthProvider } from '@/firebase/auth/use-user';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// 🔥 KONFIGURASI YANG SUDAH DIPERBAIKI SESUAI DATA ANDA 🔥
const firebaseConfig = {
  apiKey: "AIzaSyDrWsPeG-OPyqkDc8di0zxLGXRd7xMW_6I",
  authDomain: "landease-1g97g.firebaseapp.com",
  projectId: "landease-1g97g",
  storageBucket: "landease-1g97g.firebasestorage.app", // <- Perbaikan di sini
  messagingSenderId: "121206095671",
  appId: "1:121206095671:web:4abd4a6ea473c72fb0e4b2"
};

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

function initializeFirebase(): FirebaseServices | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase config is missing or invalid!");
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
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  if (!firebaseServices) {
     return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-destructive mb-2">Firebase Not Configured</h2>
            <p className="text-muted-foreground">
                Firebase configuration is missing or invalid. Please check your client-provider file.
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
        <FirebaseErrorListener />
      </AuthProvider>
    </FirebaseProvider>
  );
}