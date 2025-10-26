// Utility to log scan results to Supabase database
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

/**
 * Log a scan result to Supabase database
 * @param {string} messageText - The message that was scanned
 * @param {Object} result - The analysis result
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object|null>} - The inserted record or null if failed
 */
export async function logScanToSupabase(messageText, result, metadata = {}) {
  // Skip if Supabase is not configured
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping cloud logging');
    return null;
  }

  try {
    // Debug: Check current session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Current Supabase session:', sessionData?.session ? 'authenticated' : 'anonymous');

    const scanData = {
      // Input data
      message_text: messageText,

      // Analysis results
      verdict: result.verdict || 'unclear',
      confidence: result.confidence || null,
      risk_level: result.risk_level || null,

      // Detailed analysis
      reasons: result.reasons || [],
      explanation: result.explanation || null,
      action_recommended: result.action_recommended || null,

      // Metadata
      is_offline_analysis: result.isOffline || false,
      model_used: result.model || null,
      analysis_duration_ms: metadata.duration || null,

      // Device info (anonymous)
      device_id: metadata.deviceId || null,
      app_version: Constants.expoConfig?.version || null,

      // User ID (if available - optional for authenticated users)
      user_id: metadata.userId || null,

      // Geographic data (optional)
      country_code: metadata.countryCode || null,
    };

    const { data, error } = await supabase
      .from('scam_scans')
      .insert([scanData])
      .select()
      .single();

    if (error) {
      console.error('Error logging scan to Supabase:', error);
      console.error('Scan data attempted:', JSON.stringify(scanData, null, 2));
      console.error('Supabase client role:', supabase.auth.getSession ? 'has auth' : 'no auth');
      return null;
    }

    console.log('Successfully logged scan to Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('Exception logging scan to Supabase:', error);
    return null;
  }
}

/**
 * Get scan statistics from Supabase
 * @param {string} userId - Optional user ID to filter by
 * @returns {Promise<Object>} - Statistics object
 */
export async function getSupabaseStatistics(userId = null) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    let query = supabase
      .from('scam_scans')
      .select('verdict, confidence, risk_level, created_at');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }

    // Calculate statistics
    const stats = {
      total_scans: data.length,
      scams_detected: data.filter(s => s.verdict === 'scam').length,
      suspicious_count: data.filter(s => s.verdict === 'suspicious').length,
      safe_count: data.filter(s => s.verdict === 'likely_legitimate').length,
      avg_confidence: data.reduce((sum, s) => sum + (s.confidence || 0), 0) / data.length || 0,
      last_scan: data.length > 0 ? data[0].created_at : null,
    };

    return stats;
  } catch (error) {
    console.error('Exception fetching statistics:', error);
    return null;
  }
}

/**
 * Get recent scans from Supabase
 * @param {number} limit - Number of scans to retrieve
 * @param {string} userId - Optional user ID to filter by
 * @returns {Promise<Array>} - Array of scan records
 */
export async function getRecentScans(limit = 20, userId = null) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('scam_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recent scans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching recent scans:', error);
    return [];
  }
}

/**
 * Get high-risk scams from Supabase
 * @param {number} limit - Number of scams to retrieve
 * @returns {Promise<Array>} - Array of high-risk scam records
 */
export async function getHighRiskScams(limit = 50) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('recent_high_risk_scams')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching high-risk scams:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching high-risk scams:', error);
    return [];
  }
}
