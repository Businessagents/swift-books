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
    console.log('Sending invoice');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    // Fetch invoice with items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    console.log(`Processing invoice ${invoice.invoice_number} for ${invoice.client_email}`);

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHTML(invoice);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'Swift-Books <invoices@swift-books.ca>', // Replace with your verified domain
      to: [invoice.client_email],
      subject: `Invoice ${invoice.invoice_number} from Swift-Books`,
      html: invoiceHtml,
      text: `
Invoice ${invoice.invoice_number}

Dear ${invoice.client_name},

Please find attached your invoice for $${invoice.total_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Issue Date: ${new Date(invoice.issue_date).toLocaleDateString('en-CA')}
- Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-CA')}
- Amount: $${invoice.total_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })} CAD

${invoice.payment_instructions || 'Please remit payment by the due date.'}

Thank you for your business!

Swift-Books
      `
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse.data?.id);

    // Update invoice status
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Failed to update invoice status:', updateError);
    }

    console.log(`Invoice ${invoice.invoice_number} sent successfully to ${invoice.client_email}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        invoiceNumber: invoice.invoice_number,
        clientEmail: invoice.client_email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending invoice:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateInvoiceHTML(invoice: any): string {
  const itemsHtml = invoice.items.map((item: any) => `
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 12px 0;">${item.description}</td>
      <td style="border-bottom: 1px solid #eee; padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="border-bottom: 1px solid #eee; padding: 12px 0; text-align: right;">$${item.unit_price.toFixed(2)}</td>
      <td style="border-bottom: 1px solid #eee; padding: 12px 0; text-align: right; font-weight: bold;">$${item.line_total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .client-info { background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .items-table { width: 100%; background-color: white; border-radius: 8px; overflow: hidden; }
        .items-table th { background-color: #e5e7eb; padding: 15px; text-align: left; }
        .items-table td { padding: 12px 15px; }
        .totals { background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .final-total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #2563eb; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 2em;">INVOICE</h1>
          <p style="margin: 10px 0 0 0; font-size: 1.1em;">Swift-Books Accounting</p>
        </div>
        
        <div class="content">
          <div class="invoice-details">
            <div>
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
              <p><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString('en-CA')}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-CA')}</p>
              ${invoice.terms ? `<p><strong>Terms:</strong> ${invoice.terms}</p>` : ''}
            </div>
          </div>

          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.client_name}</strong></p>
            ${invoice.client_email ? `<p>Email: ${invoice.client_email}</p>` : ''}
            ${invoice.client_address ? `<div style="white-space: pre-line;">${invoice.client_address}</div>` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>HST (13%):</span>
              <span>$${invoice.tax_amount.toFixed(2)}</span>
            </div>
            <div class="total-row final-total">
              <span>Total Amount:</span>
              <span>$${invoice.total_amount.toFixed(2)} ${invoice.currency}</span>
            </div>
          </div>

          ${invoice.payment_instructions ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3>Payment Instructions</h3>
              <div style="white-space: pre-line;">${invoice.payment_instructions}</div>
            </div>
          ` : ''}

          ${invoice.notes ? `
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3>Notes</h3>
              <div style="white-space: pre-line;">${invoice.notes}</div>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #666;">
            <p>Thank you for your business!</p>
            <p>Swift-Books Accounting | Professional Invoicing & Expense Management</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}