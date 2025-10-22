// Known scam patterns for offline detection
// These patterns are based on common scam messages from recent years

export const SCAM_PATTERNS = {
  // Common toll scam amounts and patterns
  tollScamAmounts: [
    /\$11\.69/,
    /\$12\.51/,
    /\$6\.99/,
    /\$3\.55/,
    /\$4\.91/,
  ],

  // Urgent action phrases
  urgentPhrases: [
    /urgent.{0,10}action/i,
    /immediate.{0,10}attention/i,
    /act.{0,5}now/i,
    /expires?.{0,5}(today|tonight|soon|in)/i,
    /final.{0,5}(notice|warning|reminder)/i,
    /account.{0,10}(suspended|locked|restricted)/i,
    /verify.{0,5}immediately/i,
    /click.{0,5}(here|link|now)/i,
    /within.{0,5}\d+.{0,5}hours?/i,
    /late.{0,5}fee/i,
  ],

  // Suspicious URLs
  suspiciousUrls: [
    /bit\.ly/i,
    /tinyurl/i,
    /short\.link/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
    /[a-z]+-[a-z]+\.com/i, // Hyphenated domains that mimic real ones
  ],

  // Government/company impersonation
  impersonation: [
    /usps.{0,10}package/i,
    /fedex.{0,10}delivery/i,
    /ups.{0,10}shipment/i,
    /irs.{0,10}(refund|tax|payment)/i,
    /social.{0,5}security/i,
    /medicare/i,
    /dmv/i,
    /toll.{0,10}(bill|payment|invoice|charge)/i,
    /e-?zpass/i,
    /fastrak/i,
  ],

  // Financial red flags
  financialFlags: [
    /won.{0,10}(prize|lottery|million)/i,
    /inheritance/i,
    /nigerian/i,
    /claim.{0,10}(reward|prize|money)/i,
    /free.{0,5}(gift|card|money)/i,
    /crypto/i,
    /bitcoin/i,
  ],

  // Grammar and formatting issues
  grammarIssues: [
    /\s{2,}/, // Multiple spaces
    /[A-Z]{5,}/, // Too many caps in a row
    /!!!+/, // Multiple exclamation marks
    /\$\$+/, // Multiple dollar signs
  ],
};

// Function to perform quick offline pattern check
export function quickPatternCheck(message) {
  if (!message || message.length < 10) {
    return null;
  }

  const indicators = [];
  let score = 0;

  // Check toll scam amounts
  for (const pattern of SCAM_PATTERNS.tollScamAmounts) {
    if (pattern.test(message)) {
      indicators.push('Contains known toll scam amount');
      score += 30;
    }
  }

  // Check urgent phrases
  for (const pattern of SCAM_PATTERNS.urgentPhrases) {
    if (pattern.test(message)) {
      indicators.push('Uses urgent/threatening language');
      score += 20;
      break; // Count only once
    }
  }

  // Check suspicious URLs
  for (const pattern of SCAM_PATTERNS.suspiciousUrls) {
    if (pattern.test(message)) {
      indicators.push('Contains suspicious URL');
      score += 25;
      break;
    }
  }

  // Check impersonation
  for (const pattern of SCAM_PATTERNS.impersonation) {
    if (pattern.test(message)) {
      indicators.push('Appears to impersonate legitimate organization');
      score += 20;
      break;
    }
  }

  // Check financial flags
  for (const pattern of SCAM_PATTERNS.financialFlags) {
    if (pattern.test(message)) {
      indicators.push('Contains financial scam indicators');
      score += 15;
      break;
    }
  }

  // Check grammar issues
  let grammarCount = 0;
  for (const pattern of SCAM_PATTERNS.grammarIssues) {
    if (pattern.test(message)) {
      grammarCount++;
    }
  }
  if (grammarCount >= 2) {
    indicators.push('Poor grammar or formatting');
    score += 10;
  }

  // Return assessment based on score
  if (score >= 50) {
    return {
      verdict: 'scam',
      confidence: Math.min(95, score),
      risk_level: 'high',
      reasons: indicators,
      explanation: 'This message shows multiple scam indicators. Do not click links or provide information.',
      action_recommended: 'Delete this message immediately and block the sender.',
      isOffline: true,
    };
  } else if (score >= 25) {
    return {
      verdict: 'suspicious',
      confidence: Math.min(85, score + 20),
      risk_level: 'medium',
      reasons: indicators,
      explanation: 'This message contains suspicious elements. Proceed with caution.',
      action_recommended: 'Verify the sender through official channels before taking any action.',
      isOffline: true,
    };
  } else if (indicators.length > 0) {
    return {
      verdict: 'suspicious',
      confidence: 60,
      risk_level: 'low',
      reasons: indicators,
      explanation: 'Some suspicious patterns detected. Be cautious.',
      action_recommended: 'Consider verifying the message authenticity before responding.',
      isOffline: true,
    };
  }

  return null; // No clear determination offline
}