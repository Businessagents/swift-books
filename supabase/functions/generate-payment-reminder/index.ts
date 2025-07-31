import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating payment reminder');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { 
      invoiceId, 
      tone, 
      clientName, 
      invoiceNumber, 
      amount, 
      dueDate, 
      daysOverdue 
    } = await req.json();
    
    if (!invoiceId || !tone || !clientName || !invoiceNumber || !amount) {
      throw new Error('Missing required fields');
    }

    console.log(`Generating ${tone} reminder for invoice ${invoiceNumber}`);

    let generatedMessage = "";

    // Use OpenAI if available, otherwise use rule-based templates
    if (openAIApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional business communication specialist. Generate polite but effective payment reminder emails for Canadian businesses. Always be professional and maintain good client relationships while being clear about payment expectations.

Tone guidelines:
- "friendly": Warm, understanding, and relationship-focused
- "formal": Professional, business-standard language
- "urgent": Direct, assertive, but still professional

Include relevant Canadian business context and maintain professional courtesy throughout.`
              },
              {
                role: 'user',
                content: `Generate a ${tone} payment reminder email for:

Client: ${clientName}
Invoice: ${invoiceNumber}
Amount: $${amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD
Due Date: ${new Date(dueDate).toLocaleDateString('en-CA')}
Days Overdue: ${daysOverdue} days

The email should be professional, clear about the payment expectation, and appropriate for the ${tone} tone requested. Include a clear subject line and professional closing.`
              }
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          generatedMessage = data.choices[0].message.content;
        } else {
          console.error('OpenAI API error:', await response.text());
          throw new Error('OpenAI API error');
        }
      } catch (error) {
        console.error('OpenAI generation error:', error);
        // Fall back to template-based generation
        generatedMessage = generateTemplateMessage(tone, clientName, invoiceNumber, amount, dueDate, daysOverdue);
      }
    } else {
      console.log('No OpenAI API key found, using template-based generation');
      generatedMessage = generateTemplateMessage(tone, clientName, invoiceNumber, amount, dueDate, daysOverdue);
    }

    // Log the reminder generation
    await supabase
      .from('reminders')
      .insert({
        invoice_id: invoiceId,
        subject: `Payment Reminder - Invoice ${invoiceNumber}`,
        message: generatedMessage,
        tone: tone,
        status: 'pending',
        scheduled_at: new Date().toISOString(),
      });

    console.log(`Payment reminder generated successfully for invoice ${invoiceNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: generatedMessage,
        tone: tone,
        invoiceNumber: invoiceNumber,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating payment reminder:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateTemplateMessage(tone: string, clientName: string, invoiceNumber: string, amount: number, dueDate: string, daysOverdue: number): string {
  const formattedAmount = amount.toLocaleString('en-CA', { minimumFractionDigits: 2 });
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-CA');

  switch (tone) {
    case 'friendly':
      return `Subject: Friendly Reminder - Invoice ${invoiceNumber}

Hi ${clientName},

I hope this message finds you well! I wanted to reach out regarding invoice ${invoiceNumber} for $${formattedAmount} CAD, which was due on ${formattedDueDate}.

I understand that things can get busy, so I wanted to send a friendly reminder about this outstanding payment. If you have any questions about the invoice or need to discuss payment arrangements, please don't hesitate to reach out.

Thank you for your continued business, and I look forward to hearing from you soon.

Best regards,
[Your Name]

P.S. If you've already processed this payment, please disregard this message.`;

    case 'formal':
      return `Subject: Payment Reminder - Invoice ${invoiceNumber}

Dear ${clientName},

This is a formal reminder regarding the outstanding payment for invoice ${invoiceNumber} in the amount of $${formattedAmount} CAD, which was due on ${formattedDueDate}.

According to our records, this payment is now ${daysOverdue} days overdue. Please remit payment at your earliest convenience to avoid any potential late fees or service interruptions.

If you have already processed this payment, please disregard this notice. If you have any questions or concerns regarding this invoice, please contact us immediately.

We appreciate your prompt attention to this matter.

Sincerely,
[Your Name]`;

    case 'urgent':
      return `Subject: URGENT: Payment Required - Invoice ${invoiceNumber}

Dear ${clientName},

URGENT: Payment Required for Invoice ${invoiceNumber}

This is an urgent reminder that payment for invoice ${invoiceNumber} in the amount of $${formattedAmount} CAD is now ${daysOverdue} days overdue (due date: ${formattedDueDate}).

Immediate payment is required to avoid:
• Late payment fees
• Potential service suspension
• Collection proceedings

Please contact us immediately to resolve this matter or remit payment by end of business today.

Time-sensitive response required.

[Your Name]

Note: If payment has been sent, please provide transaction details immediately.`;

    default:
      return generateTemplateMessage('formal', clientName, invoiceNumber, amount, dueDate, daysOverdue);
  }
}