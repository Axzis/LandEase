'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Correctly get the auth instance from the provider.
  const auth = useAuth(); 
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If the auth service isn't ready, don't do anything.
    if (!auth) {
      // In a well-configured app, this shouldn't happen after initial load.
      // We set loading to false because there's nothing to load without auth.
      setLoading(false);
      return;
    }

    // `onAuthStateChanged` is the correct way to listen to user state.
    // It returns an unsubscribe function that we call on cleanup.
    const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
            setUser(user);
            setLoading(false);
        },
        (error) => {
            console.error("Auth state error:", error);
            setError(error);
            setLoading(false);
        }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // The effect re-runs only if the auth instance changes.
  
  const value = { user, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUser = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useUser must be used within an AuthProvider');
    }
    return context;
}
