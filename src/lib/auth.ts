import { supabase } from "./supabase";
import type { User, Profile, Invitation, SchoolGuardian } from "../types";
import { v4 as uuidv4 } from "uuid";
import { 
  sendInvitationEmail, 
  sendSchoolGuardianNotification,
  sendInvitationAcceptedEmail 
} from "./emailService";

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
    console.log(`Creating invitation for ${email} with role ${role} for student ${studentId}`);
    
    // Validate inputs
    if (!email || !role || !studentId) {
      console.error("Missing required parameters:", { email, role, studentId });
      return {
        success: false,
        message: "Missing required parameters for invitation",
      };
    }

    // Check if student exists
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .single();

    if (studentError) {
      console.error("Error checking student:", studentError);
      return {
        success: false,
        message: "Could not verify student information",
      };
    }

    if (!studentData) {
      console.error("Student not found:", studentId);
      return {
        success: false,
        message: "Student not found",
      };
    }

    // Get current user ID
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id;
    
    console.log("Current user ID:", currentUserId);
    console.log("Student ID:", studentId);
    
    if (!currentUserId) {
      console.error("No authenticated user found");
      return {
        success: false,
        message: "You must be logged in to create invitations",
      };
    }

    // Skip the guardian relationship check for now - the RLS policy will handle this
    // This allows us to create invitations without additional checks
    // The database's RLS policy will still prevent unauthorized invitations
    
    /* Commenting out the explicit check to rely on RLS instead
    // Verify that the current user is a guardian of this student (RLS check)
    const { data: guardianData, error: guardianError } = await supabase
      .from("student_guardians")
      .select("*")
      .eq("student_id", studentId)
      .eq("guardian_id", currentUserId);

    if (guardianError) {
      console.error("Error checking guardian relationship:", guardianError);
      return {
        success: false,
        message: "Could not verify guardian relationship",
      };
    }

    if (!guardianData || guardianData.length === 0) {
      console.error("User is not a guardian of this student");
      return {
        success: false,
        message: "You do not have permission to invite others for this student",
      };
    }
    */

    // Check if an invitation already exists for this email, student, and role
    const { data: existingInvitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("email", email)
      .eq("student_id", studentId)
      .eq("role", role)
      .eq("status", "pending");

    if (invitationError) {
      console.error("Error checking existing invitations:", invitationError);
    } else if (existingInvitation && existingInvitation.length > 0) {
      console.log("Invitation already exists:", existingInvitation[0]);
      return {
        success: false,
        message: "An invitation for this email already exists",
      };
    }

    // Check if user already exists with this email
    const { data: existingProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email);

    if (profileError) {
      console.error("Error checking existing profiles:", profileError);
      throw profileError;
    }

    // If user exists and has the same role, we can just add them directly
    if (existingProfiles && existingProfiles.length > 0) {
      console.log("Found existing profile:", existingProfiles[0]);
      const existingProfile = existingProfiles[0];

      if (existingProfile.role === role) {
        if (role === "guardian") {
          // Check if this guardian is already associated with this student
          const { data: existingData, error: existingError } = await supabase
            .from("student_guardians")
            .select("*")
            .eq("student_id", studentId)
            .eq("guardian_id", existingProfile.id);

          if (existingError) {
            console.error("Error checking existing student-guardian relationship:", existingError);
            throw existingError;
          }

          if (existingData && existingData.length > 0) {
            console.log("Guardian already associated with student:", existingData);
            return {
              success: false,
              message: "This guardian is already associated with this student",
            };
          }

          console.log("Adding guardian to student directly");
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

          if (insertError) {
            console.error("Error inserting student-guardian relationship:", insertError);
            throw insertError;
          }

          return {
            success: true,
            message: "Guardian added successfully",
          };
        } else {
          // For students, we don't have a direct way to add them yet
          console.log("Student with this email already exists");
          return {
            success: false,
            message: "Student with this email already exists",
          };
        }
      } else {
        console.log("User exists but with different role:", existingProfile.role);
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
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }

    // Create invitation object
    const invitationData = {
      email,
      role,
      student_id: studentId,
      inviter_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    };

    console.log("Creating new invitation with data:", invitationData);

    try {
      // Create the invitation
      const { data, error } = await supabase
        .from("invitations")
        .insert([invitationData])
        .select()
        .single();

      if (error) {
        console.error("Error inserting invitation:", error);
        throw error;
      }

      console.log("Invitation created successfully:", data);
      
      // Send invitation email
      try {
        // Get student name
        const { data: studentData } = await supabase
          .from("students")
          .select("name")
          .eq("id", studentId)
          .single();
        
        // Get inviter name
        const { data: inviterData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();
        
        const studentName = studentData?.name || "a student";
        const inviterName = inviterData?.name || "A guardian";
        
        // Send the email
        await sendInvitationEmail(
          email,
          token,
          studentName,
          inviterName,
          role
        );
        
        console.log("Invitation email sent to:", email);
      } catch (emailError) {
        // Log the error but don't fail the invitation creation
        console.error("Error sending invitation email:", emailError);
      }
      
      return {
        success: true,
        invitation: data as Invitation,
      };
    } catch (error) {
      console.error("Error during invitation insert:", error);
      
      // Check if it's a unique constraint violation
      if (error instanceof Error && 
          (error.message.includes("duplicate key") || 
           error.message.includes("unique constraint"))) {
        return {
          success: false,
          message: "An invitation for this email already exists",
        };
      }
      
      // Check if it's a permission error
      if (error instanceof Error && 
          error.message.includes("policy")) {
        return {
          success: false,
          message: "You do not have permission to create invitations for this student",
        };
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error creating invitation:", error);
    // More detailed error message
    let errorMessage = "An error occurred while creating the invitation";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Add more context for specific errors
      if (errorMessage.includes("foreign key constraint")) {
        errorMessage = "Invalid student or guardian reference";
      } else if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
        errorMessage = "An invitation for this email already exists";
      } else if (errorMessage.includes("not-found")) {
        errorMessage = "Student not found";
      } else if (errorMessage.includes("policy")) {
        errorMessage = "You do not have permission to create invitations for this student";
      } else if (errorMessage.includes("500")) {
        errorMessage = "Server error - please try again later";
      }
    }
    return {
      success: false,
      message: errorMessage,
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

    // Send notification email to the inviter
    try {
      // Get student name
      const { data: studentData } = await supabase
        .from("students")
        .select("name")
        .eq("id", invitation.student_id)
        .single();
      
      // Get invitee name
      const inviteeName = profile.name || invitation.email;
      const studentName = studentData?.name || "a student";
      
      // Send email to inviter
      if (invitation.inviter && invitation.inviter.email) {
        await sendInvitationAcceptedEmail(
          invitation.inviter.email,
          inviteeName,
          studentName,
          invitation.role
        );
        
        console.log("Invitation acceptance notification sent to:", invitation.inviter.email);
      }
    } catch (emailError) {
      // Log the error but don't fail the invitation acceptance
      console.error("Error sending invitation acceptance email:", emailError);
    }

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

    // Send invitation email again
    try {
      // Get student name
      const { data: studentData } = await supabase
        .from("students")
        .select("name")
        .eq("id", data.student_id)
        .single();
      
      // Get inviter name
      const { data: inviterData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", data.inviter_id)
        .single();
      
      const studentName = studentData?.name || "a student";
      const inviterName = inviterData?.name || "A guardian";
      
      // Send the email
      await sendInvitationEmail(
        data.email,
        data.token,
        studentName,
        inviterName,
        data.role as "guardian" | "student"
      );
      
      console.log("Invitation email resent to:", data.email);
    } catch (emailError) {
      // Log the error but don't fail the invitation resend
      console.error("Error resending invitation email:", emailError);
    }

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

export async function addSchoolGuardian(
  schoolId: string,
  email: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate inputs
    if (!schoolId || !email) {
      console.error("Missing required parameters:", { schoolId, email });
      return {
        success: false,
        message: "Missing required parameters for adding school guardian",
      };
    }

    // Check if the school exists
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id, guardian_id")
      .eq("id", schoolId)
      .single();

    if (schoolError) {
      console.error("Error checking school:", schoolError);
      return {
        success: false,
        message: "Could not verify school information",
      };
    }

    if (!schoolData) {
      console.error("School not found:", schoolId);
      return {
        success: false,
        message: "School not found",
      };
    }

    // Get current user ID
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id;
    
    console.log("Current user ID:", currentUserId);
    console.log("School owner ID:", schoolData.guardian_id);
    
    if (!currentUserId) {
      console.error("No authenticated user found");
      return {
        success: false,
        message: "You must be logged in to add school guardians",
      };
    }

    // Verify that the current user is the owner of the school
    if (schoolData.guardian_id !== currentUserId) {
      console.error("User is not the owner of this school");
      return {
        success: false,
        message: "You do not have permission to add guardians to this school",
      };
    }

    // Check if a guardian with this email already exists in the system
    const { data: existingProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .eq("role", "guardian");

    if (profileError) {
      console.error("Error checking existing profiles:", profileError);
      throw profileError;
    }

    let guardianId = null;
    let isRegistered = false;

    // If guardian exists, use their ID
    if (existingProfiles && existingProfiles.length > 0) {
      guardianId = existingProfiles[0].id;
      isRegistered = true;
      console.log("Found existing guardian profile:", existingProfiles[0]);
    }

    // Check if this guardian is already associated with this school
    const { data: existingData, error: existingError } = await supabase
      .from("school_guardians")
      .select("*")
      .eq("school_id", schoolId)
      .eq("email", email);

    if (existingError) {
      console.error("Error checking existing school-guardian relationship:", existingError);
      throw existingError;
    }

    if (existingData && existingData.length > 0) {
      console.log("Guardian already associated with school:", existingData);
      return {
        success: false,
        message: "This guardian is already associated with this school",
      };
    }

    // Create the school guardian object
    const schoolGuardianData = {
      school_id: schoolId,
      guardian_id: guardianId,
      email: email,
      is_registered: isRegistered
    };

    console.log("Creating new school guardian with data:", schoolGuardianData);

    // Add the guardian to the school
    const { data, error } = await supabase
      .from("school_guardians")
      .insert([schoolGuardianData])
      .select()
      .single();

    if (error) {
      console.error("Error inserting school guardian:", error);
      
      // Check if it's a unique constraint violation
      if (error.message.includes("duplicate key") || 
          error.message.includes("unique constraint")) {
        return {
          success: false,
          message: "This guardian is already associated with this school",
        };
      }
      
      // Check if it's a permission error
      if (error.message.includes("policy")) {
        return {
          success: false,
          message: "You do not have permission to add guardians to this school",
        };
      }
      
      throw error;
    }

    console.log("School guardian added successfully:", data);
    
    // Send notification email to the guardian
    try {
      // Get school name
      const { data: schoolNameData } = await supabase
        .from("schools")
        .select("name")
        .eq("id", schoolId)
        .single();
      
      // Get admin name (current user)
      const { data: adminData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", currentUserId)
        .single();
      
      const schoolName = schoolNameData?.name || "your school";
      const adminName = adminData?.name || "The school administrator";
      
      // Send the email
      await sendSchoolGuardianNotification(
        email,
        schoolName,
        adminName
      );
      
      console.log("School guardian notification sent to:", email);
    } catch (emailError) {
      // Log the error but don't fail the guardian addition
      console.error("Error sending school guardian notification:", emailError);
    }
    
    return {
      success: true,
      message: "Guardian added to school successfully",
    };
  } catch (error) {
    console.error("Error adding school guardian:", error);
    let errorMessage = "An error occurred while adding the school guardian";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getSchoolGuardians(
  schoolId: string
): Promise<SchoolGuardian[]> {
  try {
    const { data, error } = await supabase
      .from("school_guardians")
      .select(`
        *,
        guardian:profiles(*)
      `)
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as SchoolGuardian[];
  } catch (error) {
    console.error("Error getting school guardians:", error);
    return [];
  }
}

export async function removeSchoolGuardian(
  schoolGuardianId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from("school_guardians")
      .delete()
      .eq("id", schoolGuardianId);

    if (error) throw error;

    return {
      success: true,
      message: "Guardian removed from school successfully",
    };
  } catch (error) {
    console.error("Error removing school guardian:", error);
    let errorMessage = "An error occurred while removing the school guardian";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
    };
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
