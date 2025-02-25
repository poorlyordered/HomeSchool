import { supabase } from './supabase';

export async function signUp(email: string, password: string, role: 'guardian' | 'student') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password.trim(),
    options: { 
      data: { role },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password.trim()
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  try {
    // First check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
  
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: user.user_metadata.role || 'guardian'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return null;
      }

      return {
        ...user,
        profile: profileError.data
      };
    }

    return {
      ...user,
      profile
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
    }
    return null;
  }
}