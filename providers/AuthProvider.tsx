import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';


interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

 
  const setPremiumStatus = (status: boolean) => {
    setIsPremium(status);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      setIsPremium(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  
  const value: AuthState = {
    session,
    user: session?.user ?? null,
    loading,
    isPremium,
    setPremiumStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}