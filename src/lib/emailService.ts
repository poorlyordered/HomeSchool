import { supabase } from './supabase';

/**
 * Email service for sending transactional emails via Supabase
 * 
 * This module provides functions for sending various types of transactional emails
 * such as invitations, notifications, and alerts using Supabase's email functionality.
 */

interface EmailResult {
  success: boolean;
  message?: string;
}

/**
 * Sends an invitation email to a user
 * 
 * @param email - Recipient's email address
 * @param token - Invitation token for the acceptance link
 * @param studentName - Name of the student being invited to
 * @param inviterName - Name of the person sending the invitation
 * @param role - Role being invited to (guardian or student)
 * @returns EmailResult indicating success or failure
 */
export async function sendInvitationEmail(
  email: string,
  token: string,
  studentName: string,
  inviterName: string,
  role: "guardian" | "student"
): Promise<EmailResult> {
  try {
    // Create the invitation acceptance URL
    const acceptUrl = `${window.location.origin}/invitation/accept?token=${token}`;
    
    // Prepare email content
    const subject = `Invitation to join ${studentName}'s HomeSchool account`;
    const content = `
      <h2>You've been invited!</h2>
      <p>${inviterName} has invited you to join ${studentName}'s HomeSchool account as a ${role}.</p>
      <p>Click the link below to accept this invitation:</p>
      <p><a href="${acceptUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 48 hours.</p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
    `;
    
    // Send email via Supabase
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject,
        html: content,
      },
    });
    
    if (error) {
      console.error('Error sending invitation email:', error);
      return {
        success: false,
        message: `Failed to send invitation email: ${error.message}`,
      };
    }
    
    return {
      success: true,
      message: 'Invitation email sent successfully',
    };
  } catch (error) {
    console.error('Error in sendInvitationEmail:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error sending invitation email',
    };
  }
}

/**
 * Sends a notification email to a school guardian
 * 
 * @param email - Recipient's email address
 * @param schoolName - Name of the school
 * @param adminName - Name of the school administrator
 * @returns EmailResult indicating success or failure
 */
export async function sendSchoolGuardianNotification(
  email: string,
  schoolName: string,
  adminName: string
): Promise<EmailResult> {
  try {
    // Prepare email content
    const subject = `You've been added as a guardian for ${schoolName}`;
    const content = `
      <h2>School Guardian Access</h2>
      <p>${adminName} has added you as a guardian for ${schoolName} in the HomeSchool system.</p>
      <p>This means you can now be invited to manage student records for this school.</p>
      <p>If you already have an account, no further action is needed.</p>
      <p>If you don't have an account yet, you'll receive an invitation when someone adds you to a student's record.</p>
      <p>If you believe this was done in error, please contact the school administrator.</p>
    `;
    
    // Send email via Supabase
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject,
        html: content,
      },
    });
    
    if (error) {
      console.error('Error sending school guardian notification:', error);
      return {
        success: false,
        message: `Failed to send notification email: ${error.message}`,
      };
    }
    
    return {
      success: true,
      message: 'School guardian notification sent successfully',
    };
  } catch (error) {
    console.error('Error in sendSchoolGuardianNotification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error sending notification email',
    };
  }
}

/**
 * Sends a reminder email for an invitation that will expire soon
 * 
 * @param email - Recipient's email address
 * @param token - Invitation token for the acceptance link
 * @param studentName - Name of the student
 * @param expirationDate - Date when the invitation expires
 * @returns EmailResult indicating success or failure
 */
export async function sendInvitationReminderEmail(
  email: string,
  token: string,
  studentName: string,
  expirationDate: Date
): Promise<EmailResult> {
  try {
    // Create the invitation acceptance URL
    const acceptUrl = `${window.location.origin}/invitation/accept?token=${token}`;
    
    // Format expiration date
    const formattedDate = expirationDate.toLocaleString();
    
    // Prepare email content
    const subject = `Reminder: Your invitation for ${studentName}'s HomeSchool account is expiring soon`;
    const content = `
      <h2>Invitation Reminder</h2>
      <p>Your invitation to join ${studentName}'s HomeSchool account will expire on ${formattedDate}.</p>
      <p>Click the link below to accept this invitation before it expires:</p>
      <p><a href="${acceptUrl}">Accept Invitation</a></p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
    `;
    
    // Send email via Supabase
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject,
        html: content,
      },
    });
    
    if (error) {
      console.error('Error sending invitation reminder email:', error);
      return {
        success: false,
        message: `Failed to send reminder email: ${error.message}`,
      };
    }
    
    return {
      success: true,
      message: 'Invitation reminder email sent successfully',
    };
  } catch (error) {
    console.error('Error in sendInvitationReminderEmail:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error sending reminder email',
    };
  }
}

/**
 * Sends a notification when an invitation has been accepted
 * 
 * @param email - Recipient's email address (the inviter)
 * @param inviteeName - Name of the person who accepted the invitation
 * @param studentName - Name of the student
 * @param role - Role that was accepted (guardian or student)
 * @returns EmailResult indicating success or failure
 */
export async function sendInvitationAcceptedEmail(
  email: string,
  inviteeName: string,
  studentName: string,
  role: "guardian" | "student"
): Promise<EmailResult> {
  try {
    // Prepare email content
    const subject = `Invitation Accepted for ${studentName}'s HomeSchool account`;
    const content = `
      <h2>Invitation Accepted</h2>
      <p>${inviteeName} has accepted your invitation to join ${studentName}'s HomeSchool account as a ${role}.</p>
      <p>They now have access to the student's information according to their role permissions.</p>
    `;
    
    // Send email via Supabase
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject,
        html: content,
      },
    });
    
    if (error) {
      console.error('Error sending invitation accepted email:', error);
      return {
        success: false,
        message: `Failed to send acceptance notification: ${error.message}`,
      };
    }
    
    return {
      success: true,
      message: 'Invitation acceptance notification sent successfully',
    };
  } catch (error) {
    console.error('Error in sendInvitationAcceptedEmail:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error sending acceptance notification',
    };
  }
}
