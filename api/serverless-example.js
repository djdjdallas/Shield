// Example serverless function for production deployment
// Deploy this to Vercel, Netlify, or any serverless platform
// This keeps your API key secure on the server side

// For Vercel: Save as api/analyze.js
// For Netlify: Save as netlify/functions/analyze.js

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

// Vercel Handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Get API key from environment variable
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const prompt = SCAM_DETECTION_PROMPT.replace('{user_message}', message);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from the response if parsing fails
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse Claude response');
      }
    }

    // Add rate limit headers for client
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '99');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    // Don't expose internal error details to client
    return res.status(500).json({
      error: 'Analysis failed',
      message: 'Unable to analyze message at this time. Please try again.'
    });
  }
}

// Netlify Handler (for Netlify Functions)
// exports.handler = async (event, context) => {
//   if (event.httpMethod !== 'POST') {
//     return {
//       statusCode: 405,
//       body: JSON.stringify({ error: 'Method not allowed' }),
//     };
//   }
//
//   const { message } = JSON.parse(event.body);
//
//   if (!message) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ error: 'Message is required' }),
//     };
//   }
//
//   const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
//
//   if (!ANTHROPIC_API_KEY) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'API key not configured' }),
//     };
//   }
//
//   try {
//     // Same API logic as above...
//     // Return result
//     return {
//       statusCode: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify(result),
//     };
//   } catch (error) {
//     console.error('Analysis error:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Analysis failed' }),
//     };
//   }
// };

// AWS Lambda Handler
// export const handler = async (event) => {
//   // Similar implementation as above
//   // Parse event.body, call API, return response
// };