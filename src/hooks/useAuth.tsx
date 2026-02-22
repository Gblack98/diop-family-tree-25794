import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  role: 'admin' | 'moderator';
  username: string | null;
  display_name: string | null;
  email: string | null;
  suspended: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Profile fetch error:', fetchError);

        // Afficher l'erreur mais ne pas bloquer
        if (fetchError.code === 'PGRST116') {
          setError('Profil non trouvé. Vérifiez que votre compte existe dans la table profiles.');
        } else {
          setError(`Erreur: ${fetchError.message}`);
        }
        setProfile(null);
      } else {
        setProfile(data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    // Le profil sera chargé via onAuthStateChange
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setUser(null);
  };

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isModerator: profile?.role === 'moderator',
    isAuthenticated: !!user && !!profile && !profile.suspended,
  };
}
