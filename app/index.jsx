// Main scanner screen - the heart of Scam Shield
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Import our custom components and utilities
import { Colors } from '../constants/colors';
import { quickPatternCheck } from '../constants/scamPatterns';
import { analyzeWithClaude } from '../api/claude';
import { saveToHistory } from '../utils/storage';
import ResultCard from '../components/ResultCard';

export default function ScannerScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  // Check clipboard on mount and focus
  useEffect(() => {
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      const hasContent = await Clipboard.hasStringAsync();
      setHasClipboardContent(hasContent);
    } catch (error) {
      console.log('Clipboard check error:', error);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setMessage(text);
        setCharCount(text.length);
        // Provide haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not paste from clipboard');
    }
  };

  const handleTextChange = (text) => {
    setMessage(text);
    setCharCount(text.length);
  };

  const clearMessage = () => {
    setMessage('');
    setCharCount(0);
    setResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const analyzeMessage = async () => {
    if (!message.trim()) {
      Alert.alert('No Message', 'Please enter or paste a message to analyze');
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();

    // Start loading
    setLoading(true);
    setResult(null);

    try {
      // First, try offline pattern matching for quick results
      const offlineResult = quickPatternCheck(message);

      if (offlineResult && offlineResult.confidence >= 75) {
        // High confidence offline result - show immediately
        setResult(offlineResult);
        await saveToHistory(message, offlineResult);

        // Provide strong haptic feedback for scam
        if (offlineResult.verdict === 'scam') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }

      // Now try to get Claude's analysis for more detailed results
      const apiKey = Constants.expoConfig?.extra?.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

      if (!apiKey || apiKey === 'YOUR_ANTHROPIC_API_KEY_HERE') {
        // No API key configured - use offline result only
        if (!offlineResult) {
          setResult({
            verdict: 'unknown',
            confidence: 0,
            risk_level: 'unknown',
            reasons: ['AI analysis unavailable'],
            explanation: 'Please configure API key for full AI-powered analysis. Limited offline checking performed.',
            action_recommended: 'Configure the app with an API key for complete scam detection.',
            isOffline: true,
          });
        }
      } else {
        // Call Claude API for full analysis
        const claudeResult = await analyzeWithClaude(message, apiKey);

        if (claudeResult) {
          setResult(claudeResult);
          await saveToHistory(message, claudeResult);

          // Haptic feedback based on verdict
          if (claudeResult.verdict === 'scam') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } else if (claudeResult.verdict === 'likely_legitimate') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        } else if (!offlineResult) {
          // API failed and no offline result
          throw new Error('Analysis failed');
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);

      // If we don't have an offline result, show error
      if (!result) {
        Alert.alert(
          'Analysis Error',
          'Could not analyze the message. Please check your internet connection and try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <MaterialIcons name="security" size={48} color={Colors.primary} />
          <Text style={styles.title}>Scan Suspicious Messages</Text>
          <Text style={styles.subtitle}>
            Paste or type any suspicious text message to check if it's a scam
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Quick Paste Button */}
          {hasClipboardContent && !message && (
            <TouchableOpacity
              style={styles.pasteButton}
              onPress={pasteFromClipboard}
              activeOpacity={0.8}
            >
              <Ionicons name="clipboard" size={24} color="#FFFFFF" />
              <Text style={styles.pasteButtonText}>Paste from Clipboard</Text>
            </TouchableOpacity>
          )}

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Paste or type your suspicious message here..."
              placeholderTextColor={Colors.textMuted}
              value={message}
              onChangeText={handleTextChange}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />

            {/* Character count and clear button */}
            <View style={styles.inputFooter}>
              <Text style={styles.charCount}>{charCount} / 2000</Text>
              {message.length > 0 && (
                <TouchableOpacity onPress={clearMessage}>
                  <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!message.trim() || loading) && styles.analyzeButtonDisabled,
            ]}
            onPress={analyzeMessage}
            disabled={!message.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <FontAwesome5 name="search" size={20} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>Analyze Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultsSection}>
            <ResultCard result={result} message={message} />
          </View>
        )}

        {/* Tips Section (when no result) */}
        {!result && !loading && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Common Scam Signs:</Text>
            <View style={styles.tipItem}>
              <MaterialIcons name="warning" size={20} color={Colors.warning} />
              <Text style={styles.tipText}>Urgent language & threats</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="link" size={20} color={Colors.warning} />
              <Text style={styles.tipText}>Suspicious shortened URLs</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="attach-money" size={20} color={Colors.warning} />
              <Text style={styles.tipText}>Requests for immediate payment</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="error" size={20} color={Colors.warning} />
              <Text style={styles.tipText}>Poor grammar & spelling</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  pasteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 15,
    marginBottom: 15,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    maxHeight: 200,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  analyzeButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultsSection: {
    marginTop: 20,
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 10,
    flex: 1,
  },
});