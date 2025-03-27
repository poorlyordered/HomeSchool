# Supabase Edge Function: send-email

This Edge Function provides email sending capabilities for the HomeSchool application using Supabase.

## Overview

The `send-email` function is a Supabase Edge Function that handles sending transactional emails for various application events:

- Invitation emails
- School guardian notifications
- Invitation acceptance notifications
- Invitation reminder emails

## Deployment

### Prerequisites

1. Supabase CLI installed
   ```bash
   npm install -g supabase
   ```

2. Supabase project set up and linked
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

### Environment Variables

Before deploying, you need to set up the following environment variables in your Supabase project:

```bash
supabase secrets set SMTP_HOST=your-smtp-host
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USERNAME=your-smtp-username
supabase secrets set SMTP_PASSWORD=your-smtp-password
supabase secrets set DEFAULT_FROM=noreply@homeschool.app
supabase secrets set DEFAULT_REPLY_TO=support@homeschool.app
```

You can use any SMTP provider such as:
- SendGrid
- Mailgun
- Amazon SES
- Gmail (for testing only)

### Deploy the Function

```bash
supabase functions deploy send-email
```

## Testing

You can test the function locally before deploying:

```bash
supabase functions serve send-email --env-file .env.local
```

Create a `.env.local` file with the required environment variables:

```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
DEFAULT_FROM=noreply@homeschool.app
DEFAULT_REPLY_TO=support@homeschool.app
```

Then test with curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello World</h1><p>This is a test email.</p>"
  }'
```

## Usage from Frontend

The function is called from the frontend using the Supabase client:

```typescript
const { error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'recipient@example.com',
    subject: 'Test Email',
    html: '<h1>Hello World</h1><p>This is a test email.</p>'
  },
});
```

## Security Considerations

- The function uses CORS headers to allow requests from any origin
- Authentication is handled by Supabase
- Sensitive information like SMTP credentials are stored as environment variables
- Input validation is performed to ensure required fields are present

## TypeScript Errors

When viewing the Edge Function code in your IDE, you may see TypeScript errors related to:
- Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'
- Cannot find module 'https://deno.land/x/smtp@v0.7.0/mod.ts'
- Cannot find name 'Deno'

These errors are **expected and can be safely ignored**. They occur because:

1. Supabase Edge Functions use the Deno runtime, which is different from Node.js
2. Deno uses URL imports instead of npm packages
3. The TypeScript configuration in your project is set up for Node.js, not Deno

The function will work correctly when deployed to Supabase, which provides the proper Deno environment.
