// Tests for storage utilities
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveToHistory,
  getScanHistory,
  deleteHistoryItem,
  clearHistory,
  getStatistics,
} from '../../utils/storage';

describe('Storage Utilities', () => {
  beforeEach(async () => {
    // Clear all storage before each test
    await AsyncStorage.clear();
  });

  describe('saveToHistory', () => {
    it('should save scan result to history', async () => {
      const message = 'Test scam message';
      const result = {
        verdict: 'scam',
        confidence: 95,
        risk_level: 'high',
        reasons: ['Test reason'],
        explanation: 'Test explanation',
        action_recommended: 'Delete message',
      };

      const entry = await saveToHistory(message, result);

      expect(entry).not.toBeNull();
      expect(entry.message).toBe(message);
      expect(entry.result).toEqual(result);
      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
    });

    it('should add new entries to the beginning of history', async () => {
      const message1 = 'First message';
      const result1 = { verdict: 'scam', confidence: 90 };

      const message2 = 'Second message';
      const result2 = { verdict: 'suspicious', confidence: 70 };

      await saveToHistory(message1, result1);
      await saveToHistory(message2, result2);

      const history = await getScanHistory();

      expect(history[0].message).toBe(message2);
      expect(history[1].message).toBe(message1);
    });

    it('should limit history to MAX_HISTORY_ITEMS', async () => {
      const MAX_ITEMS = 50;

      // Add more than MAX items
      for (let i = 0; i < MAX_ITEMS + 10; i++) {
        await saveToHistory(`Message ${i}`, { verdict: 'scam', confidence: 90 });
      }

      const history = await getScanHistory();
      expect(history.length).toBeLessThanOrEqual(MAX_ITEMS);
    });
  });

  describe('getScanHistory', () => {
    it('should return empty array when no history exists', async () => {
      const history = await getScanHistory();
      expect(history).toEqual([]);
    });

    it('should retrieve saved history', async () => {
      const message = 'Test message';
      const result = { verdict: 'scam', confidence: 95 };

      await saveToHistory(message, result);
      const history = await getScanHistory();

      expect(history).toHaveLength(1);
      expect(history[0].message).toBe(message);
      expect(history[0].result).toEqual(result);
    });
  });

  describe('deleteHistoryItem', () => {
    it('should delete specific history item by ID', async () => {
      const entry1 = await saveToHistory('Message 1', { verdict: 'scam' });
      const entry2 = await saveToHistory('Message 2', { verdict: 'safe' });
      const entry3 = await saveToHistory('Message 3', { verdict: 'suspicious' });

      // Verify items were saved
      const historyBeforeDelete = await getScanHistory();
      expect(historyBeforeDelete).toHaveLength(3);

      const success = await deleteHistoryItem(entry2.id);

      expect(success).toBe(true);

      const history = await getScanHistory();
      expect(history).toHaveLength(2);
      expect(history.find(item => item.id === entry2.id)).toBeUndefined();
      expect(history.find(item => item.id === entry1.id)).toBeDefined();
      expect(history.find(item => item.id === entry3.id)).toBeDefined();
    });

    it('should return true even if item does not exist', async () => {
      const success = await deleteHistoryItem('non-existent-id');
      expect(success).toBe(true);
    });
  });

  describe('clearHistory', () => {
    it('should remove all history items', async () => {
      await saveToHistory('Message 1', { verdict: 'scam' });
      await saveToHistory('Message 2', { verdict: 'scam' });
      await saveToHistory('Message 3', { verdict: 'scam' });

      const success = await clearHistory();
      expect(success).toBe(true);

      const history = await getScanHistory();
      expect(history).toEqual([]);
    });
  });

  describe('getStatistics', () => {
    it('should return zero statistics when no history', async () => {
      const stats = await getStatistics();

      expect(stats.totalScans).toBe(0);
      expect(stats.scamsDetected).toBe(0);
      expect(stats.suspiciousCount).toBe(0);
      expect(stats.safeCount).toBe(0);
    });

    it('should count scams detected', async () => {
      await saveToHistory('Scam 1', { verdict: 'scam' });
      await saveToHistory('Scam 2', { verdict: 'scam' });
      await saveToHistory('Safe message', { verdict: 'likely_legitimate' });

      const stats = await getStatistics();

      expect(stats.scamsDetected).toBe(2);
      expect(stats.totalScans).toBe(3);
    });

    it('should count suspicious and safe messages separately', async () => {
      await saveToHistory('Scam', { verdict: 'scam' });
      await saveToHistory('Suspicious', { verdict: 'suspicious' });
      await saveToHistory('Safe', { verdict: 'likely_legitimate' });

      const stats = await getStatistics();

      expect(stats.scamsDetected).toBe(1);
      expect(stats.suspiciousCount).toBe(1);
      expect(stats.safeCount).toBe(1);
      expect(stats.totalScans).toBe(3);
    });
  });
});
