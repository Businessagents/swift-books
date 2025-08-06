import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const RETRY_DELAY_MULTIPLIER = 2;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let receiptId: string | null = null;
  let supabase: any;

  try {
    console.log('Processing receipt OCR request');
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    const requestBody = await req.json();
    receiptId = requestBody.receiptId;
    const imageData = requestBody.imageData;
    const retryCount = requestBody.retryCount || 0;
    
    if (!receiptId || !imageData) {
      throw new Error('Receipt ID and image data are required');
    }

    console.log(`Processing receipt: ${receiptId} (attempt ${retryCount + 1})`);

    // Update receipt status to processing
    await supabase
      .from('receipts')
      .update({ 
        status: 'processing',
        processed_at: retryCount === 0 ? new Date().toISOString() : undefined
      })
      .eq('id', receiptId);

    // Call Google Vision API for OCR with retry logic
    const ocrResult = await performOCRWithRetry(
      imageData, 
      googleVisionApiKey, 
      retryCount
    );

    const { ocrText, confidence } = ocrResult;
    console.log('OCR extracted text:', ocrText.substring(0, 200) + '...');

    // Extract receipt details using regex patterns
    const extractedData = extractReceiptData(ocrText);
    console.log('Extracted data:', extractedData);

    // Get AI category suggestion with retry
    const categoryData = await getCategorySuggestionWithRetry(
      ocrText, 
      extractedData, 
      retryCount
    );
    console.log('AI category suggestion:', categoryData);

    // Update receipt with OCR results
    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        status: 'processed',
        ocr_text: ocrText,
        ocr_confidence: confidence,
        vendor_name: extractedData.vendor,
        total_amount: extractedData.amount,
        tax_amount: extractedData.tax,
        receipt_date: extractedData.date,
        ai_suggested_category: categoryData.category,
        ai_confidence: categoryData.confidence,
        processed_at: new Date().toISOString(),
      })
      .eq('id', receiptId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Receipt ${receiptId} processed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        receiptId,
        ocrText: ocrText.substring(0, 500),
        extractedData,
        categoryData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing receipt:', error);
    
    // Determine if this is a retryable error
    const isRetryable = isRetryableError(error);
    const requestBody = await req.clone().json().catch(() => ({}));
    const currentRetryCount = requestBody.retryCount || 0;
    
    if (isRetryable && currentRetryCount < MAX_RETRIES - 1) {
      console.log(`Retryable error, scheduling retry ${currentRetryCount + 1}`);
      
      // Update receipt status to indicate retry
      if (receiptId && supabase) {
        try {
          await supabase
            .from('receipts')
            .update({ 
              status: 'processing',
              processed_at: new Date().toISOString()
            })
            .eq('id', receiptId);
        } catch (updateError) {
          console.error('Failed to update receipt status for retry:', updateError);
        }
      }
      
      // Return error with retry instruction
      return new Response(
        JSON.stringify({ 
          error: error.message,
          retryable: true,
          retryAfter: INITIAL_RETRY_DELAY * Math.pow(RETRY_DELAY_MULTIPLIER, currentRetryCount),
          currentRetry: currentRetryCount
        }),
        {
          status: 503, // Service Unavailable, indicating retry
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Update receipt status to failed if we can't retry
    if (receiptId && supabase) {
      try {
        await supabase
          .from('receipts')
          .update({ 
            status: 'failed',
            processed_at: new Date().toISOString()
          })
          .eq('id', receiptId);
      } catch (updateError) {
        console.error('Failed to update receipt status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        retryable: false,
        finalAttempt: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractReceiptData(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract vendor name (usually first meaningful line)
  const vendor = lines.find(line => 
    line.length > 3 && 
    !line.match(/^\d+$/) && 
    !line.toLowerCase().includes('receipt') &&
    !line.toLowerCase().includes('tax') &&
    !line.match(/^\$?\d+\.?\d*$/)
  ) || '';

  // Extract total amount
  const amountPatterns = [
    /total:?\s*\$?(\d+\.?\d*)/i,
    /amount:?\s*\$?(\d+\.?\d*)/i,
    /\$(\d+\.\d{2})/g
  ];
  
  let amount = null;
  for (const pattern of amountPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      const values = matches.map(match => {
        const num = match.replace(/[^\d.]/g, '');
        return parseFloat(num);
      }).filter(val => !isNaN(val) && val > 0);
      
      if (values.length > 0) {
        amount = Math.max(...values); // Take the largest amount as total
        break;
      }
    }
  }

  // Extract tax amount
  const taxPatterns = [
    /(?:tax|gst|hst|pst):?\s*\$?(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*%?\s*(?:tax|gst|hst|pst)/i
  ];
  
  let tax = null;
  for (const pattern of taxPatterns) {
    const match = text.match(pattern);
    if (match) {
      tax = parseFloat(match[1]);
      break;
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/
  ];
  
  let date = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        date = new Date(match[1]).toISOString().split('T')[0];
        break;
      } catch {
        continue;
      }
    }
  }

  return {
    vendor: vendor.substring(0, 100), // Limit length
    amount,
    tax,
    date: date || new Date().toISOString().split('T')[0], // Default to today
  };
}

async function performOCRWithRetry(
  imageData: string, 
  apiKey: string | undefined, 
  retryCount: number
): Promise<{ ocrText: string; confidence: number }> {
  if (!apiKey) {
    throw new Error('Google Vision API key not configured');
  }

  const visionResponse = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
            },
            features: [
              { type: 'TEXT_DETECTION', maxResults: 1 }
            ],
          },
        ],
      }),
    }
  );

  if (!visionResponse.ok) {
    const errorText = await visionResponse.text();
    throw new Error(`Google Vision API error (${visionResponse.status}): ${errorText}`);
  }

  const visionData = await visionResponse.json();
  const textAnnotations = visionData.responses[0]?.textAnnotations;
  
  if (!textAnnotations || textAnnotations.length === 0) {
    throw new Error('No text detected in the image');
  }

  return {
    ocrText: textAnnotations[0].description,
    confidence: textAnnotations[0].confidence || 0.5
  };
}

async function getCategorySuggestionWithRetry(
  ocrText: string, 
  extractedData: any, 
  retryCount: number
): Promise<{ category: string; confidence: number }> {
  try {
    return await getCategorySuggestion(ocrText, extractedData);
  } catch (error) {
    console.error(`Category suggestion failed (attempt ${retryCount + 1}):`, error);
    // Return rule-based fallback
    return getRuleBasedCategory(ocrText, extractedData);
  }
}

function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const retryableErrors = [
    'network error',
    'timeout',
    'rate limit',
    'quota exceeded',
    'service unavailable',
    'internal server error',
    'bad gateway',
    'gateway timeout',
    'temporarily unavailable'
  ];
  
  return retryableErrors.some(errorType => message.includes(errorType));
}

async function getCategorySuggestion(ocrText: string, extractedData: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('No OpenAI API key found, using rule-based categorization');
    return getRuleBasedCategory(ocrText, extractedData);
  }

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
            content: `You are a Canadian business expense categorization expert. Based on the receipt text, suggest the most appropriate CRA business expense category.

Categories to choose from:
- Office Supplies & Equipment
- Business Travel & Transportation
- Business Entertainment & Meals
- Professional Services
- Software & Subscriptions
- Marketing & Advertising
- Utilities & Communications
- Vehicle & Fuel
- Training & Education
- Insurance
- Other Business Expenses

Respond with ONLY a JSON object: {"category": "category_name", "confidence": 0.XX}`
          },
          {
            role: 'user',
            content: `Receipt text: ${ocrText.substring(0, 1000)}\nVendor: ${extractedData.vendor}\nAmount: $${extractedData.amount}`
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return {
        category: result.category,
        confidence: result.confidence
      };
    }
  } catch (error) {
    console.error('OpenAI categorization error:', error);
  }

  // Fallback to rule-based
  return getRuleBasedCategory(ocrText, extractedData);
}

function getRuleBasedCategory(ocrText: string, extractedData: any) {
  const text = ocrText.toLowerCase();
  const vendor = extractedData.vendor?.toLowerCase() || '';

  // Rule-based categorization
  if (text.includes('gas') || text.includes('fuel') || text.includes('petro') || text.includes('shell')) {
    return { category: 'Vehicle & Fuel', confidence: 0.9 };
  }
  if (text.includes('restaurant') || text.includes('coffee') || text.includes('meal') || text.includes('food')) {
    return { category: 'Business Entertainment & Meals', confidence: 0.8 };
  }
  if (text.includes('office') || text.includes('staples') || text.includes('supplies')) {
    return { category: 'Office Supplies & Equipment', confidence: 0.85 };
  }
  if (text.includes('microsoft') || text.includes('software') || text.includes('subscription')) {
    return { category: 'Software & Subscriptions', confidence: 0.9 };
  }
  if (text.includes('uber') || text.includes('taxi') || text.includes('transit') || text.includes('parking')) {
    return { category: 'Business Travel & Transportation', confidence: 0.85 };
  }

  return { category: 'Other Business Expenses', confidence: 0.6 };
}