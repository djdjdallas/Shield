// Claude API integration for scam detection
// This file handles communication with the Anthropic Claude API

// IMPORTANT: For production, replace this with a serverless function endpoint
// The API key should NEVER be stored in the mobile app for security reasons

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// For production, use serverless endpoint from environment variable
// Set EXPO_PUBLIC_API_ENDPOINT in your .env file after deploying serverless function
const SERVERLESS_ENDPOINT = process.env.EXPO_PUBLIC_API_ENDPOINT || null;

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

// Main function to analyze message with Claude
export async function analyzeWithClaude(message, apiKey, metadata = {}) {
  try {
    // If serverless endpoint is configured, use it (recommended for production)
    if (SERVERLESS_ENDPOINT) {
      return await callServerlessFunction(message, metadata);
    }

    // Direct API call (development only - NOT for production)
    // WARNING: This exposes your API key in the app bundle
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const prompt = SCAM_DETECTION_PROMPT.replace('{user_message}', message);

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku for fast, cost-effective responses
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2, // Low temperature for consistent analysis
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Extract the JSON response from Claude's message
    const content = data.content[0].text;

    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      return result;
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse Claude response');
    }
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

// Function to call serverless endpoint (recommended for production)
async function callServerlessFunction(message, metadata = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add optional metadata headers for server-side logging
    if (metadata.deviceId) headers['x-device-id'] = metadata.deviceId;
    if (metadata.appVersion) headers['x-app-version'] = metadata.appVersion;
    if (metadata.userId) headers['x-user-id'] = metadata.userId;

    const response = await fetch(SERVERLESS_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Server request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Serverless function error:', error);
    return null;
  }
}

// Example serverless function code (Vercel/Netlify)
// Save this as a separate file in your serverless backend
export const serverlessExample = `
// api/analyze.js (Vercel example)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

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
      throw new Error(\`API request failed: \${response.status}\`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse and return the JSON response
    const result = JSON.parse(content);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
`;

// Cache for API responses (to avoid duplicate API calls)
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get cached response or make new API call
export async function analyzeWithCache(message, apiKey, metadata = {}) {
  // Generate cache key from message
  const cacheKey = message.trim().toLowerCase();

  // Check cache
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  // Make API call
  const result = await analyzeWithClaude(message, apiKey, metadata);

  // Cache the result
  if (result) {
    responseCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    cleanCache();
  }

  return result;
}

// Clean old cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
}