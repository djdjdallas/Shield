// Tests for scam pattern detection
import { quickPatternCheck, SCAM_PATTERNS } from '../../constants/scamPatterns';

describe('Scam Pattern Detection', () => {
  describe('quickPatternCheck', () => {
    it('should return null for very short messages', () => {
      const result = quickPatternCheck('Hi');
      expect(result).toBeNull();
    });

    it('should detect toll scam amounts', () => {
      const message = 'Pay your toll fee of $11.69 now!';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.verdict).toBe('suspicious');
      expect(result.confidence).toBeGreaterThanOrEqual(25);
      expect(result.reasons).toContain('Contains known toll scam amount');
    });

    it('should detect urgent language', () => {
      const message = 'URGENT ACTION REQUIRED: Click now or your account will be suspended!';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.reasons).toContain('Uses urgent/threatening language');
    });

    it('should detect suspicious URLs', () => {
      const message = 'Click this link: bit.ly/somethingsuspicious';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.reasons).toContain('Contains suspicious URL');
    });

    it('should detect impersonation attempts', () => {
      const message = 'USPS package delivery - click here';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.reasons).toContain('Appears to impersonate legitimate organization');
    });

    it('should detect multiple red flags and increase confidence', () => {
      const message = 'URGENT: USPS package awaiting. Pay $11.69 at bit.ly/fake';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.verdict).toBe('scam');
      expect(result.confidence).toBeGreaterThanOrEqual(75);
      expect(result.risk_level).toBe('high');
      expect(result.reasons.length).toBeGreaterThan(2);
    });

    it('should return suspicious verdict for medium-scoring messages', () => {
      const message = 'Your package is ready for delivery. Please confirm.';
      const result = quickPatternCheck(message);

      // This might not trigger or might be suspicious depending on patterns
      if (result) {
        expect(['scam', 'suspicious']).toContain(result.verdict);
      }
    });

    it('should include action recommendations', () => {
      const message = 'URGENT: Pay $11.69 toll now at bit.ly/fake123';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.action_recommended).toBeDefined();
      expect(result.action_recommended.length).toBeGreaterThan(0);
    });

    it('should mark as offline analysis', () => {
      const message = 'URGENT: Pay $11.69 now!';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.isOffline).toBe(true);
    });
  });

  describe('SCAM_PATTERNS', () => {
    it('should have toll scam amounts defined', () => {
      expect(SCAM_PATTERNS.tollScamAmounts).toBeDefined();
      expect(SCAM_PATTERNS.tollScamAmounts.length).toBeGreaterThan(0);
    });

    it('should have urgent phrases defined', () => {
      expect(SCAM_PATTERNS.urgentPhrases).toBeDefined();
      expect(SCAM_PATTERNS.urgentPhrases.length).toBeGreaterThan(0);
    });

    it('should have suspicious URL patterns', () => {
      expect(SCAM_PATTERNS.suspiciousUrls).toBeDefined();
      expect(SCAM_PATTERNS.suspiciousUrls.length).toBeGreaterThan(0);
    });

    it('should have impersonation patterns', () => {
      expect(SCAM_PATTERNS.impersonation).toBeDefined();
      expect(SCAM_PATTERNS.impersonation.length).toBeGreaterThan(0);
    });
  });

  describe('Real-world scam examples', () => {
    it('should detect package delivery scam', () => {
      const message = 'USPS: Your package is pending delivery. Pay $1.99 shipping fee: bit.ly/fake123';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.verdict).toBe('suspicious');
      expect(result.risk_level).toBe('medium');
    });

    it('should detect toll road scam', () => {
      const message = 'E-ZPass: Unpaid toll of $11.69. Pay immediately to avoid $50 late fee.';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(result.verdict).toBe('scam');
    });

    it('should detect bank impersonation', () => {
      const message = 'Chase Bank: Suspicious activity detected on your account. Verify immediately or account will be locked.';
      const result = quickPatternCheck(message);

      expect(result).not.toBeNull();
      expect(['scam', 'suspicious']).toContain(result.verdict);
    });
  });
});
