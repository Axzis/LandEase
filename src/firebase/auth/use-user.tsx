'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
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
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    if (!auth) {
      setLoading(false);
      // If auth service isn't available, we can't determine user state.
      // Depending on app logic, you might want to set an error here.
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(
        (user) => {
            setUser(user);
            setLoading(false);
        },
        (error) => {
            setError(error);
            setLoading(false);
        }
    );
    return () => unsubscribe();
  }, [auth]);
  
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
