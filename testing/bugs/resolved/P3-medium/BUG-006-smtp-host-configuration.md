# BUG-006: SMTP Host Configuration Error in send-email Edge Function

## Priority: P3-Medium

## Status: Resolved

## Description

When attempting to send guardian invitations, users encountered a 500 server error. The error occurred during the API call to create an invitation in the database, specifically when the system tried to send an invitation email as part of the invitation creation process.

## Steps to Reproduce

1. Log in as a guardian
2. Navigate to a student's management page
3. Click "Manage Access"
4. Enter an email address for a new guardian
5. Click "Send Invitation"
6. Observe the 500 server error in the console

## Expected Behavior

The invitation should be created successfully and an email should be sent to the invited guardian.

## Actual Behavior

The system fails with a 500 server error. The console shows:

```
vlvamfplfqgmosokuxqm…tatus%22&select=*:1 Failed to load resource: the server responded with a status of 500 ()
```

## Root Cause

The SMTP host configuration in the `.env.local` file for the send-email Edge Function had an incorrect value:

```
SMTP_HOST=smtp.smtp.resend.com
```

The host had a duplicate "smtp." prefix, which caused the SMTP connection to fail when attempting to send emails.

## Fix

The SMTP host configuration was corrected to:

```
SMTP_HOST=smtp.resend.com
```

This fix ensures that the SMTP connection can be established properly when sending emails.

## Verification

After deploying the updated Edge Function with the corrected SMTP host configuration, guardian invitations can be created successfully and invitation emails are sent properly.

## Related Issues

None

## Notes

- The SMTP configuration is stored in the `.env.local` file, which is not committed to the repository as it contains sensitive information.
- The Edge Function needs to be redeployed to Supabase after making changes to the configuration.
