import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { mapAuthError, normalizeEmail } from '../lib/authHelpers';
import type { Profile } from '../types/database';

interface AuthResult {
  error: string | null;
  info?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isRecoveryMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfileWithRetry(userId: string, retries = 3): Promise<Profile | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      return data as Profile;
    }
    if (error && attempt === retries - 1) {
      console.error('Error al cargar perfil:', error.message);
    }
    if (attempt < retries - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    }
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/reset-password' ||
      window.location.hash.includes('type=recovery')
    );
  });

  const loadProfileForSession = useCallback(async (activeSession: Session | null) => {
    if (!activeSession?.user) {
      setProfile(null);
      return;
    }

    let loaded = await fetchProfileWithRetry(activeSession.user.id, 3);

    if (!loaded) {
      const meta = activeSession.user.user_metadata || {};
      const fallbackEmail = normalizeEmail(activeSession.user.email || '');
      const fallbackName = (
        (meta.full_name as string) ||
        fallbackEmail.split('@')[0] ||
        'Estudiante'
      ).trim();

      loaded = {
        id: activeSession.user.id,
        email: fallbackEmail,
        username: fallbackEmail,
        full_name: fallbackName,
        role: 'student',
        created_at: new Date().toISOString(),
      };
    } else if (!loaded.email && activeSession.user.email) {
      loaded = { ...loaded, email: normalizeEmail(activeSession.user.email) };
    }

    setProfile(loaded);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const initSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(initialSession);
        await loadProfileForSession(initialSession);
      } catch (err) {
        console.error('Error inicializando sesión:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      } else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
      }

      setSession(nextSession);
      void loadProfileForSession(nextSession).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfileForSession]);

  const signIn = async (emailRaw: string, password: string): Promise<AuthResult> => {
    const email = normalizeEmail(emailRaw);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    setIsRecoveryMode(false);
    setSession(data.session);
    await loadProfileForSession(data.session);
    return { error: null };
  };

  const signUp = async (
    fullName: string,
    emailRaw: string,
    password: string
  ): Promise<AuthResult> => {
    const cleanEmail = normalizeEmail(emailRaw);
    const cleanFullName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: cleanFullName,
          username: cleanEmail,
        },
      },
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    if (!data.session) {
      return {
        error: null,
        info:
          '¡Cuenta creada! Revisa tu bandeja de entrada o carpeta de spam para confirmar tu correo electrónico y luego inicia sesión.',
      };
    }

    setIsRecoveryMode(false);
    setSession(data.session);
    await loadProfileForSession(data.session);
    return { error: null };
  };

  const requestPasswordReset = async (emailRaw: string): Promise<AuthResult> => {
    const cleanEmail = normalizeEmail(emailRaw);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    return {
      error: null,
      info:
        'Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.',
    };
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    setIsRecoveryMode(false);
    if (data.user) {
      const {
        data: { session: latestSession },
      } = await supabase.auth.getSession();
      setSession(latestSession);
      await loadProfileForSession(latestSession);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsRecoveryMode(false);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session) {
      await loadProfileForSession(session);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        isRecoveryMode,
        signIn,
        signUp,
        requestPasswordReset,
        updatePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return ctx;
}
