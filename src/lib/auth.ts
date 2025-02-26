import { supabase } from './supabase';
import type { User, Profile } from '../types';

export interface VerificationResult {
  success: boolean;
  message?: string;
}

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

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
}

export async function resetPassword(newPassword: string): Promise<void> {
  // Supabase automatically handles the token from the URL
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
}

export async function verifyEmail(): Promise<VerificationResult> {
  try {
    // Supabase automatically handles the token in the URL
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Verification error:', error);
      return { success: false, message: error.message };
    }
    
    if (!data.session) {
      return { success: false, message: 'No session found. Verification may have failed.' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during email verification:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred during verification'
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
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
      const { data: newProfile, error: profileError } = await supabase
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

      // Ensure the returned user matches the User type
      return {
        id: user.id,
        email: user.email || '',
        profile: newProfile as Profile
      };
    }

    // Ensure the returned user matches the User type
    return {
      id: user.id,
      email: user.email || '',
      profile: profile as Profile
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
