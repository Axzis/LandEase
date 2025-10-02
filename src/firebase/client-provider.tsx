'use client';

import React, { useMemo, type ReactNode } from 'react';
import { AuthProvider } from '@/firebase/auth/use-user';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { firebaseConfig } from '@/firebase/config'; // Impor dari file config

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

function initializeFirebase(): FirebaseServices | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Variabel lingkungan Firebase (NEXT_PUBLIC_FIREBASE_*) tidak diatur. Periksa file .env.local Anda.");
    return null;
  }
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);
  if (!firebaseServices) {
     return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-destructive mb-2">Firebase Tidak Terkonfigurasi</h2>
            <p className="text-muted-foreground">
                Variabel lingkungan Firebase tidak diatur. Pastikan file .env.local ada dan sudah benar.
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