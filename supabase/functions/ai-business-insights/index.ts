import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  message: string;
  context?: string;
  includeFinancialData?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context = 'general', includeFinancialData = false }: RequestBody = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    let financialContext = '';
    
    if (includeFinancialData) {
      // Fetch recent expenses with category information
      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          amount, 
          description, 
          expense_date, 
          tax_amount,
          expense_categories!category_id(name)
        `)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
        .limit(50);

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount, status, due_date, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Calculate financial summaries
      const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      const totalTax = expenses?.reduce((sum, exp) => sum + (exp.tax_amount || 0), 0) || 0;
      const totalInvoices = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;

      // Group expenses by category
      const categoryBreakdown = expenses?.reduce((acc, exp) => {
        const category = exp.expense_categories?.name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (exp.amount || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      financialContext = `
Financial Data Summary:
- Total Expenses (last 50): $${totalExpenses.toFixed(2)} CAD
- Total Tax Collected: $${totalTax.toFixed(2)} CAD  
- Total Invoices (last 20): $${totalInvoices.toFixed(2)} CAD
- Pending Invoices: ${pendingInvoices}

Top Expense Categories:
${Object.entries(categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)} CAD`)
  .join('\n')}

Recent Expenses:
${expenses?.slice(0, 10).map(exp => 
  `- ${exp.description || 'No description'}: $${exp.amount?.toFixed(2)} CAD (${exp.expense_categories?.name || 'Uncategorized'})`
).join('\n') || 'No recent expenses'}
`;
    }

    // Call OpenAI API
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a helpful AI accounting assistant for Canadian freelancers and small businesses. 
You specialize in:
- Expense categorization and tracking
- GST/HST compliance and calculations
- Business financial insights and recommendations
- Receipt analysis and bookkeeping

Always provide practical, Canada-specific advice. Be concise but helpful.
Use CAD currency format and reference Canadian tax regulations when relevant.

${includeFinancialData ? `Here's the user's current financial data:\n${financialContext}` : ''}

User Question Context: ${context}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Determine if this is an actionable business insight
    const isInsight = message.toLowerCase().includes('insight') || 
                     message.toLowerCase().includes('analyze') ||
                     message.toLowerCase().includes('recommend');

    console.log('AI Business Insights - Response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        insight: isInsight ? aiResponse : null,
        context: financialContext ? 'financial_data_included' : 'general'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ai-business-insights function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I'm sorry, I encountered an error while processing your request. Please try again."
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});