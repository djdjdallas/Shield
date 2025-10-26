// Storage utilities for managing app data with AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logScanToSupabase } from './supabaseLogger';

const STORAGE_KEYS = {
  SCAN_HISTORY: 'scan_history',
  APP_SETTINGS: 'app_settings',
  FIRST_LAUNCH: 'first_launch',
  TOTAL_SCANS: 'total_scans',
  SCAMS_DETECTED: 'scams_detected',
};

// Maximum number of history items to store
const MAX_HISTORY_ITEMS = 50;

// Save scan result to history
export async function saveToHistory(message, result, metadata = {}) {
  try {
    // Get existing history
    const history = await getScanHistory();

    // Create new history entry
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message: message,
      result: result,
    };

    // Add to beginning of array (most recent first)
    const updatedHistory = [newEntry, ...history];

    // Limit to max items
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.splice(MAX_HISTORY_ITEMS);
    }

    // Save updated history
    await AsyncStorage.setItem(
      STORAGE_KEYS.SCAN_HISTORY,
      JSON.stringify(updatedHistory)
    );

    // Update statistics
    await updateStatistics(result);

    // Also log to Supabase (async, don't wait)
    logScanToSupabase(message, result, metadata).catch(err => {
      console.log('Could not sync to cloud:', err.message);
    });

    return newEntry;
  } catch (error) {
    console.error('Error saving to history:', error);
    return null;
  }
}

// Get scan history
export async function getScanHistory() {
  try {
    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
    if (!historyJson) {
      return [];
    }
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error getting scan history:', error);
    return [];
  }
}

// Delete a specific history item
export async function deleteHistoryItem(itemId) {
  try {
    const history = await getScanHistory();
    const updatedHistory = history.filter(item => item.id !== itemId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SCAN_HISTORY,
      JSON.stringify(updatedHistory)
    );
    return true;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return false;
  }
}

// Clear all history
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SCAN_HISTORY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

// Update app statistics
async function updateStatistics(result) {
  try {
    // Increment total scans
    const totalScansStr = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_SCANS);
    const totalScans = totalScansStr ? parseInt(totalScansStr, 10) : 0;
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOTAL_SCANS,
      (totalScans + 1).toString()
    );

    // Increment scams detected if applicable
    if (result.verdict === 'scam') {
      const scamsDetectedStr = await AsyncStorage.getItem(
        STORAGE_KEYS.SCAMS_DETECTED
      );
      const scamsDetected = scamsDetectedStr ? parseInt(scamsDetectedStr, 10) : 0;
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCAMS_DETECTED,
        (scamsDetected + 1).toString()
      );
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Get app statistics
export async function getStatistics() {
  try {
    const [totalScansStr, scamsDetectedStr, history] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOTAL_SCANS),
      AsyncStorage.getItem(STORAGE_KEYS.SCAMS_DETECTED),
      getScanHistory(),
    ]);

    const totalScans = totalScansStr ? parseInt(totalScansStr, 10) : 0;
    const scamsDetected = scamsDetectedStr ? parseInt(scamsDetectedStr, 10) : 0;

    // Calculate additional statistics from history
    const suspiciousCount = history.filter(
      item => item.result?.verdict === 'suspicious'
    ).length;
    const safeCount = history.filter(
      item => item.result?.verdict === 'likely_legitimate'
    ).length;

    return {
      totalScans,
      scamsDetected,
      suspiciousCount,
      safeCount,
      historyCount: history.length,
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    return {
      totalScans: 0,
      scamsDetected: 0,
      suspiciousCount: 0,
      safeCount: 0,
      historyCount: 0,
    };
  }
}

// Check if this is the first launch
export async function isFirstLaunch() {
  try {
    const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    if (firstLaunch === null) {
      // Mark as not first launch for future
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking first launch:', error);
    return false;
  }
}

// Save app settings
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.APP_SETTINGS,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Get app settings
export async function getSettings() {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!settingsJson) {
      // Return default settings
      return {
        notifications: true,
        darkMode: false,
        autoCheckClipboard: true,
        saveHistory: true,
      };
    }
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      notifications: true,
      darkMode: false,
      autoCheckClipboard: true,
      saveHistory: true,
    };
  }
}

// Export history as JSON (for backup)
export async function exportHistory() {
  try {
    const history = await getScanHistory();
    const statistics = await getStatistics();

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      statistics,
      history,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting history:', error);
    return null;
  }
}

// Import history from JSON (restore from backup)
export async function importHistory(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data.history || !Array.isArray(data.history)) {
      throw new Error('Invalid import data format');
    }

    // Merge with existing history
    const existingHistory = await getScanHistory();
    const mergedHistory = [...data.history, ...existingHistory];

    // Remove duplicates based on ID
    const uniqueHistory = mergedHistory.filter(
      (item, index, self) => index === self.findIndex(t => t.id === item.id)
    );

    // Sort by timestamp and limit
    uniqueHistory.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (uniqueHistory.length > MAX_HISTORY_ITEMS) {
      uniqueHistory.splice(MAX_HISTORY_ITEMS);
    }

    // Save merged history
    await AsyncStorage.setItem(
      STORAGE_KEYS.SCAN_HISTORY,
      JSON.stringify(uniqueHistory)
    );

    return uniqueHistory.length;
  } catch (error) {
    console.error('Error importing history:', error);
    return null;
  }
}