# Deployment Instructions for send-email Edge Function

## Overview

This document provides instructions for deploying the send-email Edge Function to Supabase with the corrected SMTP configuration.

## Configuration Changes

The following configuration change has been made to fix the 500 server error when creating guardian invitations:

- Corrected SMTP host from `smtp.smtp.resend.com` to `smtp.resend.com` in the `.env.local` file

## Deployment Steps

### 1. Install the Supabase CLI

If you haven't already installed the Supabase CLI, you can do so using one of the following methods:

#### Windows (PowerShell)

```powershell
winget install Supabase.CLI
```

#### macOS (Homebrew)

```bash
brew install supabase/tap/supabase
```

#### Using npm (locally in a project)

```bash
npm install supabase --save-dev
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your actual Supabase project reference ID.

### 4. Set Environment Variables in Supabase

Make sure your Supabase project has the correct environment variables set:

```bash
supabase secrets set SMTP_HOST=smtp.resend.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USERNAME=resend
supabase secrets set SMTP_PASSWORD=your_smtp_password
supabase secrets set DEFAULT_FROM=noreply@outlook.com
supabase secrets set DEFAULT_REPLY_TO=homeschoolingminds@outlook.com
```

Replace `your_smtp_password` with your actual SMTP password.

### 5. Deploy the Edge Function

```bash
supabase functions deploy send-email
```

### 6. Verify Deployment

After deployment, you can verify that the Edge Function is working correctly by:

1. Logging in to the application
2. Navigating to a student's management page
3. Clicking "Manage Access"
4. Entering an email address for a new guardian
5. Clicking "Send Invitation"
6. Confirming that the invitation is created successfully without errors

## Troubleshooting

If you encounter issues during deployment or after deployment:

1. Check the Supabase dashboard for any error logs related to the Edge Function
2. Verify that all environment variables are set correctly
3. Ensure that the SMTP credentials are valid and have the necessary permissions
4. Test the SMTP connection using a tool like Telnet or a dedicated SMTP testing tool

## Notes

- The `.env.local` file is used for local development and testing only. It is not deployed to Supabase.
- The actual environment variables used by the deployed Edge Function are set using the `supabase secrets set` command.
- The Edge Function uses the Deno runtime, which is different from Node.js. Make sure any dependencies are compatible with Deno.
