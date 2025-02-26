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

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  // First verify the current password by attempting to sign in
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      throw new Error('User not found or email not available');
    }
    
    // Try to sign in with current password to verify it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });
    
    if (signInError) {
      throw new Error('Current password is incorrect');
    }
    
    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

export async function updateEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });
  
  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not found');
    }
    
    // Delete user data from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
      
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      // Continue with account deletion even if profile deletion fails
    }
    
    // Delete the user account
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    
    if (error) {
      // If admin delete fails, try to sign out as a fallback
      await signOut();
      throw error;
    }
    
    // Sign out after successful deletion
    await signOut();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
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
