import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// Note: For a complete PDF solution, you'd typically use a service like Puppeteer or jsPDF
// This is a simplified version that returns HTML that can be converted to PDF client-side

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating invoice PDF');
    
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

    console.log(`Generating PDF for invoice ${invoice.invoice_number}`);

    // Generate printable HTML
    const invoiceHtml = generatePrintableInvoiceHTML(invoice);

    // For now, we'll return the HTML and let the client handle PDF conversion
    // In production, you'd use a PDF generation service like Puppeteer or similar
    const pdfDataUrl = `data:text/html;base64,${btoa(invoiceHtml)}`;

    console.log(`PDF data generated for invoice ${invoice.invoice_number}`);

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: pdfDataUrl,
        invoiceNumber: invoice.invoice_number,
        fileName: `invoice-${invoice.invoice_number}.pdf`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generatePrintableInvoiceHTML(invoice: any): string {
  const itemsHtml = invoice.items.map((item: any) => `
    <tr>
      <td class="border-b border-gray-200 py-3">${item.description}</td>
      <td class="border-b border-gray-200 py-3 text-center">${item.quantity}</td>
      <td class="border-b border-gray-200 py-3 text-right">$${item.unit_price.toFixed(2)}</td>
      <td class="border-b border-gray-200 py-3 text-right font-semibold">$${item.line_total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        @page { margin: 0.5in; size: letter; }
        body { 
          font-family: 'Helvetica', Arial, sans-serif; 
          line-height: 1.4; 
          color: #1f2937; 
          margin: 0; 
          padding: 20px;
          font-size: 14px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header { 
          background: linear-gradient(135deg, #2563eb, #1d4ed8); 
          color: white; 
          padding: 40px 30px; 
          border-radius: 12px; 
          margin-bottom: 30px;
        }
        .company-name { font-size: 28px; font-weight: bold; margin: 0; }
        .company-tagline { font-size: 16px; margin: 8px 0 0 0; opacity: 0.9; }
        .invoice-title { font-size: 48px; font-weight: bold; text-align: right; margin: 0; }
        
        .invoice-info { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px; 
          margin-bottom: 40px; 
        }
        .info-section { 
          background: #f8fafc; 
          padding: 25px; 
          border-radius: 12px;
          border-left: 4px solid #2563eb;
        }
        .info-title { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 15px; }
        .info-item { margin-bottom: 8px; }
        .info-label { font-weight: 600; color: #374151; }
        .info-value { color: #1f2937; }
        
        .client-section {
          background: #f0f9ff;
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #0ea5e9;
          margin-bottom: 40px;
        }
        
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        .items-table th { 
          background: #e5e7eb; 
          padding: 15px; 
          text-align: left; 
          font-weight: 600;
          color: #374151;
        }
        .items-table td { 
          padding: 15px; 
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table tr:last-child td { border-bottom: none; }
        
        .totals-section { 
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 12px;
          padding: 8px 0;
        }
        .total-label { font-weight: 500; color: #374151; }
        .total-value { font-weight: 600; color: #1f2937; }
        .final-total { 
          font-size: 20px; 
          font-weight: bold; 
          border-top: 3px solid #2563eb; 
          padding-top: 15px; 
          margin-top: 15px;
          color: #2563eb;
        }
        
        .notes-section {
          background: #fefce8;
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #eab308;
          margin-bottom: 30px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
        }
        .footer p { margin: 5px 0; }
        
        @media print {
          body { print-color-adjust: exact; }
          .container { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 class="company-name">Swift-Books</h1>
              <p class="company-tagline">Professional Accounting & Invoicing</p>
            </div>
            <div>
              <h2 class="invoice-title">INVOICE</h2>
            </div>
          </div>
        </div>
        
        <div class="invoice-info">
          <div class="info-section">
            <h3 class="info-title">Invoice Details</h3>
            <div class="info-item">
              <span class="info-label">Invoice Number:</span> 
              <span class="info-value">${invoice.invoice_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Issue Date:</span> 
              <span class="info-value">${new Date(invoice.issue_date).toLocaleDateString('en-CA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Due Date:</span> 
              <span class="info-value">${new Date(invoice.due_date).toLocaleDateString('en-CA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            ${invoice.terms ? `
              <div class="info-item">
                <span class="info-label">Terms:</span> 
                <span class="info-value">${invoice.terms}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="info-section">
            <h3 class="info-title">Payment Summary</h3>
            <div class="info-item">
              <span class="info-label">Currency:</span> 
              <span class="info-value">${invoice.currency}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span> 
              <span class="info-value" style="text-transform: capitalize;">${invoice.status}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Amount:</span> 
              <span class="info-value" style="font-size: 18px; font-weight: bold; color: #2563eb;">
                $${invoice.total_amount.toFixed(2)} CAD
              </span>
            </div>
          </div>
        </div>

        <div class="client-section">
          <h3 class="info-title">Bill To</h3>
          <div style="font-size: 16px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${invoice.client_name}</div>
            ${invoice.client_email ? `<div>Email: ${invoice.client_email}</div>` : ''}
            ${invoice.client_address ? `<div style="white-space: pre-line; margin-top: 8px;">${invoice.client_address}</div>` : ''}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="width: 15%; text-align: center;">Quantity</th>
              <th style="width: 17.5%; text-align: right;">Unit Price</th>
              <th style="width: 17.5%; text-align: right;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">$${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">HST (13%):</span>
            <span class="total-value">$${invoice.tax_amount.toFixed(2)}</span>
          </div>
          <div class="total-row final-total">
            <span>Total Amount:</span>
            <span>$${invoice.total_amount.toFixed(2)} ${invoice.currency}</span>
          </div>
        </div>

        ${invoice.payment_instructions ? `
          <div class="notes-section">
            <h3 class="info-title">Payment Instructions</h3>
            <div style="white-space: pre-line; font-size: 15px; line-height: 1.6;">
              ${invoice.payment_instructions}
            </div>
          </div>
        ` : ''}

        ${invoice.notes ? `
          <div class="notes-section">
            <h3 class="info-title">Notes</h3>
            <div style="white-space: pre-line; font-size: 15px; line-height: 1.6;">
              ${invoice.notes}
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <p style="font-size: 16px; font-weight: 600;">Thank you for your business!</p>
          <p>Swift-Books | Professional Canadian Accounting Solutions</p>
          <p>Generated on ${new Date().toLocaleDateString('en-CA', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}