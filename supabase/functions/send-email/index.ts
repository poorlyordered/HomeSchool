// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-edge-functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
    const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";
    const DEFAULT_FROM = Deno.env.get("DEFAULT_FROM") || "noreply@homeschool.app";
    const DEFAULT_REPLY_TO = Deno.env.get("DEFAULT_REPLY_TO") || "support@homeschool.app";

    // Verify SMTP configuration
    if (!SMTP_HOST || !SMTP_USERNAME || !SMTP_PASSWORD) {
      throw new Error("Missing SMTP configuration");
    }

    // Parse request body
    const { to, subject, html, text, from, replyTo } = await req.json() as EmailRequest;

    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error("Missing required email fields");
    }

    // Configure SMTP client
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    });

    // Send email
    await client.send({
      from: from || DEFAULT_FROM,
      to: to,
      subject: subject,
      content: text || html,
      html: html,
      replyTo: replyTo || DEFAULT_REPLY_TO,
    });

    // Close connection
    await client.close();

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error sending email" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
