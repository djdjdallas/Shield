// Supabase Edge Function for Scam Analysis
// This protects your API key by keeping it server-side only
// Runs on Deno runtime (not Node.js)

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// The specialized prompt for scam detection
const SCAM_DETECTION_PROMPT = `<role>You are an expert cybersecurity analyst specializing in SMS/text message scam detection.</role>

<task>Analyze the provided text message and determine if it is likely a scam, legitimate, or suspicious.</task>

<analysis_criteria>
Examine for:
1. Urgency tactics (threats, deadlines, penalties)
2. Suspicious URLs (misspelled domains, unusual TLDs, shortened links)
3. Source verification (phone number format, sender ID)
4. Linguistic patterns (generic greetings, poor grammar, awkward phrasing)
5. Financial red flags (common scam amounts like $11.69, immediate payment requests)
6. Impersonation indicators (fake government agencies, spoofed companies)
</analysis_criteria>

<output_format>
Return ONLY valid JSON with this structure:
{
  "verdict": "scam" | "suspicious" | "likely_legitimate",
  "confidence": 0-100,
  "risk_level": "high" | "medium" | "low",
  "reasons": ["reason1", "reason2", ...],
  "detected_tactics": ["tactic1", "tactic2", ...],
  "explanation": "2-3 sentence summary",
  "action_recommended": "What user should do"
}
</output_format>

<message_to_analyze>
{user_message}
</message_to_analyze>`;

interface RequestBody {
  message: string;
}

interface ClaudeResponse {
  content: Array<{ text: string }>;
}

// Initialize Supabase client for logging
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to log scan to database
async function logScanToDatabase(message: string, result: any, metadata: any = {}) {
  try {
    const scanData = {
      message_text: message,
      verdict: result.verdict || 'unclear',
      confidence: result.confidence || null,
      risk_level: result.risk_level || null,
      reasons: result.reasons || [],
      explanation: result.explanation || null,
      action_recommended: result.action_recommended || null,
      is_offline_analysis: false,
      model_used: metadata.model || 'claude-3-haiku-20240307',
      analysis_duration_ms: metadata.duration || null,
      device_id: metadata.device_id || null,
      app_version: metadata.app_version || null,
      user_id: metadata.user_id || null,
      country_code: metadata.country_code || null,
    };

    const { error } = await supabaseClient
      .from('scam_scans')
      .insert([scanData]);

    if (error) {
      console.error('Error logging to database:', error);
    }
  } catch (error) {
    console.error('Exception logging to database:', error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const startTime = Date.now();

  try {
    // Parse request body
    const body: RequestBody = await req.json();
    const { message } = body;

    // Validate input
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message must be a string' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 2000 characters)' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get API key from environment
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Replace placeholder in prompt
    const prompt = SCAM_DETECTION_PROMPT.replace('{user_message}', message);

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);

      // Handle rate limits
      if (claudeResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded. Please try again in a moment.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      throw new Error(`API request failed: ${claudeResponse.status}`);
    }

    const data: ClaudeResponse = await claudeResponse.json();
    const content = data.content[0].text;

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse Claude response');
      }
    }

    // Log the scan to database (async, don't wait for it)
    const duration = Date.now() - startTime;
    logScanToDatabase(message, result, {
      model: 'claude-3-haiku-20240307',
      duration,
      device_id: req.headers.get('x-device-id'),
      app_version: req.headers.get('x-app-version'),
      user_id: req.headers.get('x-user-id'),
    }).catch(err => console.error('Failed to log scan:', err));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({
        error: 'Analysis failed. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
