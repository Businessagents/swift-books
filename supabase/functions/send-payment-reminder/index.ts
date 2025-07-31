import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const resend = new Resend(resendApiKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Sending payment reminder');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { 
      invoiceId, 
      clientEmail, 
      clientName, 
      invoiceNumber, 
      amount, 
      message, 
      tone 
    } = await req.json();
    
    if (!invoiceId || !clientEmail || !clientName || !invoiceNumber || !amount || !message) {
      throw new Error('Missing required fields');
    }

    console.log(`Sending payment reminder to ${clientEmail} for invoice ${invoiceNumber}`);

    // Extract subject from message if it exists, otherwise create one
    const messageLines = message.split('\n');
    let subject = `Payment Reminder - Invoice ${invoiceNumber}`;
    let emailBody = message;

    // Check if first line is a subject line
    if (messageLines[0].toLowerCase().startsWith('subject:')) {
      subject = messageLines[0].replace(/^subject:\s*/i, '');
      emailBody = messageLines.slice(2).join('\n'); // Skip subject and empty line
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'Swift-Books <invoices@swift-books.ca>', // Replace with your verified domain
      to: [clientEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">Payment Reminder</h2>
            <p style="color: #666; margin: 0;">Invoice ${invoiceNumber} • $${amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD</p>
          </div>
          
          <div style="white-space: pre-line; line-height: 1.6; color: #333;">
            ${emailBody.replace(/\n/g, '<br>')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated reminder from Swift-Books. If you have questions about this invoice, please reply to this email.</p>
          </div>
        </div>
      `,
      text: emailBody
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data?.id);

    // Update reminder record
    const { error: reminderError } = await supabase
      .from('reminders')
      .insert({
        invoice_id: invoiceId,
        subject: subject,
        message: emailBody,
        tone: tone,
        status: 'delivered',
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
      });

    if (reminderError) {
      console.error('Failed to log reminder:', reminderError);
      // Don't throw here as email was sent successfully
    }

    console.log(`Payment reminder sent successfully to ${clientEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        invoiceNumber: invoiceNumber,
        clientEmail: clientEmail,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending payment reminder:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});