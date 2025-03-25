import { supabase } from "./supabase";
import type { User, Profile, Invitation } from "../types";
import { v4 as uuidv4 } from "uuid";

export interface VerificationResult {
  success: boolean;
  message?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  message?: string;
}

export async function signUp(
  email: string,
  password: string,
  role: "guardian" | "student",
  name: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password.trim(),
    options: {
      data: { role, name },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password.trim(),
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

export async function validateResetToken(
  token: string,
): Promise<TokenValidationResult> {
  try {
    // Attempt to get the user associated with this token
    // This is a lightweight check that doesn't actually reset the password
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (error) {
      return {
        valid: false,
        message:
          error.message ||
          "Invalid or expired token. Please request a new password reset link.",
      };
    }

    if (!data.user) {
      return {
        valid: false,
        message: "Invalid token. Please request a new password reset link.",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating reset token:", error);
    return {
      valid: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while validating your token. Please try again or request a new link.",
    };
  }
}

export async function resetPassword(newPassword: string): Promise<void> {
  // Supabase automatically handles the token from the URL
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  // First verify the current password by attempting to sign in
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) {
      throw new Error("User not found or email not available");
    }

    // Try to sign in with current password to verify it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating password:", error);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }

    // Delete user data from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
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
    console.error("Error deleting account:", error);
    throw error;
  }
}

export async function verifyEmail(): Promise<VerificationResult> {
  try {
    // Supabase automatically handles the token in the URL
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Verification error:", error);
      return { success: false, message: error.message };
    }

    if (!data.session) {
      return {
        success: false,
        message: "No session found. Verification may have failed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error during email verification:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during verification",
    };
  }
}

export interface InvitationResult {
  success: boolean;
  invitation?: Invitation;
  message?: string;
}

export interface InvitationValidationResult {
  valid: boolean;
  invitation?: Invitation;
  message?: string;
}

export async function createInvitation(
  email: string,
  role: "guardian" | "student",
  studentId: string,
): Promise<InvitationResult> {
  try {
    // Check if user already exists with this email
    const { data: existingProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email);

    if (profileError) throw profileError;

    // If user exists and has the same role, we can just add them directly
    if (existingProfiles && existingProfiles.length > 0) {
      const existingProfile = existingProfiles[0];

      if (existingProfile.role === role) {
        if (role === "guardian") {
          // Check if this guardian is already associated with this student
          const { data: existingData, error: existingError } = await supabase
            .from("student_guardians")
            .select("*")
            .eq("student_id", studentId)
            .eq("guardian_id", existingProfile.id);

          if (existingError) throw existingError;

          if (existingData && existingData.length > 0) {
            return {
              success: false,
              message: "This guardian is already associated with this student",
            };
          }

          // Add the guardian to the student
          const { error: insertError } = await supabase
            .from("student_guardians")
            .insert([
              {
                student_id: studentId,
                guardian_id: existingProfile.id,
                is_primary: false,
              },
            ]);

          if (insertError) throw insertError;

          return {
            success: true,
            message: "Guardian added successfully",
          };
        } else {
          // For students, we don't have a direct way to add them yet
          // This would be handled by the student account creation process
          return {
            success: false,
            message: "Student with this email already exists",
          };
        }
      }
    }

    // Generate a unique token
    const token = uuidv4();

    // Set expiration date (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Get current user as inviter
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Create the invitation
    const { data, error } = await supabase
      .from("invitations")
      .insert([
        {
          email,
          role,
          student_id: studentId,
          inviter_id: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      invitation: data as Invitation,
    };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the invitation",
    };
  }
}

export async function validateInvitation(
  token: string,
): Promise<InvitationValidationResult> {
  try {
    // Get the invitation by token
    const { data, error } = await supabase
      .from("invitations")
      .select(
        `
        *,
        student:students(
          id,
          name,
          birthDate:birth_date,
          graduationDate:graduation_date
        ),
        inviter:profiles(*)
      `,
      )
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (error) {
      return {
        valid: false,
        message: "Invalid or expired invitation token",
      };
    }

    // Check if invitation has expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // Update invitation status to expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", data.id);

      return {
        valid: false,
        message: "Invitation has expired",
      };
    }

    return {
      valid: true,
      invitation: data as Invitation,
    };
  } catch (error) {
    console.error("Error validating invitation:", error);
    return {
      valid: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while validating the invitation",
    };
  }
}

export async function acceptInvitation(
  token: string,
  userId: string,
): Promise<InvitationResult> {
  try {
    // Validate the invitation first
    const validation = await validateInvitation(token);
    if (!validation.valid || !validation.invitation) {
      return {
        success: false,
        message: validation.message || "Invalid invitation",
      };
    }

    const invitation = validation.invitation;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // Check if user role matches invitation role
    if (profile.role !== invitation.role) {
      return {
        success: false,
        message: `This invitation is for a ${invitation.role} account, but your account is a ${profile.role}`,
      };
    }

    // Process based on role
    if (invitation.role === "guardian") {
      // Add guardian to student
      const { error: guardianError } = await supabase
        .from("student_guardians")
        .insert([
          {
            student_id: invitation.student_id,
            guardian_id: userId,
            is_primary: false,
          },
        ]);

      if (guardianError) throw guardianError;
    } else if (invitation.role === "student") {
      // For student role, we would need to link the student to their profile
      // This would depend on your specific data model for students
      // This is a placeholder for that logic
      console.log("Student invitation accepted, linking student to profile");
    }

    // Update invitation status to accepted
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    if (updateError) throw updateError;

    return {
      success: true,
      invitation,
      message: "Invitation accepted successfully",
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while accepting the invitation",
    };
  }
}

export async function resendInvitation(
  invitationId: string,
): Promise<InvitationResult> {
  try {
    // Get the invitation to verify it exists
    const { error: getError } = await supabase
      .from("invitations")
      .select("id")
      .eq("id", invitationId)
      .single();

    if (getError) throw getError;

    // Set new expiration date (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Update the invitation with new expiration and reset status if expired
    const { data, error: updateError } = await supabase
      .from("invitations")
      .update({
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .eq("id", invitationId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      invitation: data as Invitation,
      message: "Invitation resent successfully",
    };
  } catch (error) {
    console.error("Error resending invitation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while resending the invitation",
    };
  }
}

export async function getInvitationsByStudent(
  studentId: string,
): Promise<Invitation[]> {
  try {
    const { data, error } = await supabase
      .from("invitations")
      .select(
        `
        *,
        student:students(
          id,
          name,
          birthDate:birth_date,
          graduationDate:graduation_date
        ),
        inviter:profiles(*)
      `,
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as Invitation[];
  } catch (error) {
    console.error("Error getting invitations:", error);
    return [];
  }
}

export async function deleteInvitation(
  invitationId: string,
): Promise<InvitationResult> {
  try {
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId);

    if (error) throw error;

    return {
      success: true,
      message: "Invitation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the invitation",
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          role: user.user_metadata.role || "guardian",
          name: user.user_metadata.name || "",
        })
        .select()
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError);
        return null;
      }

      // Ensure the returned user matches the User type
      return {
        id: user.id,
        email: user.email || "",
        profile: newProfile as Profile,
      };
    }

    // Ensure the returned user matches the User type
    return {
      id: user.id,
      email: user.email || "",
      profile: profile as Profile,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error("Error signing out:", signOutError);
    }
    return null;
  }
}
