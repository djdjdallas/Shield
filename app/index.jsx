// Main scanner screen - the heart of Scam Shield
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Animated,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Import our custom components and utilities
import { Colors } from "../constants/colors";
import { GradientColors, AnimationDurations } from "../constants/glassStyles";
import { quickPatternCheck } from "../constants/scamPatterns";
import { analyzeWithClaude } from "../api/claude";
import { saveToHistory } from "../utils/storage";
import ResultCard from "../components/ResultCard";

export default function ScannerScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Check clipboard on mount and focus
  useEffect(() => {
    checkClipboard();
    // Fade in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: AnimationDurations.slow,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkClipboard = useCallback(async () => {
    try {
      const hasContent = await Clipboard.hasStringAsync();
      setHasClipboardContent(hasContent);
    } catch (error) {
      console.log("Clipboard check error:", error);
    }
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setMessage(text);
        setCharCount(text.length);
        // Provide haptic feedback and button animation
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: AnimationDurations.fast,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: AnimationDurations.fast,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      Alert.alert("Error", "Could not paste from clipboard");
    }
  }, [scaleAnim]);

  const handleTextChange = useCallback((text) => {
    setMessage(text);
    setCharCount(text.length);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
    setCharCount(0);
    setResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const analyzeMessage = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert("No Message", "Please enter or paste a message to analyze");
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();

    // Start loading and pulse animation
    setLoading(true);
    setResult(null);

    // Start pulse animation for loading state
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: AnimationDurations.pulse / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: AnimationDurations.pulse / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      // First, try offline pattern matching for quick results
      const offlineResult = quickPatternCheck(message);

      if (offlineResult && offlineResult.confidence >= 75) {
        // High confidence offline result - show immediately
        setResult(offlineResult);
        await saveToHistory(message, offlineResult);

        // Provide strong haptic feedback for scam
        if (offlineResult.verdict === "scam") {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        }
      }

      // Now try to get Claude's analysis for more detailed results
      const apiKey =
        Constants.expoConfig?.extra?.ANTHROPIC_API_KEY ||
        Constants.manifest?.extra?.ANTHROPIC_API_KEY ||
        process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === "YOUR_ANTHROPIC_API_KEY_HERE") {
        // No API key configured - use offline result only
        if (!offlineResult) {
          setResult({
            verdict: "unknown",
            confidence: 0,
            risk_level: "unknown",
            reasons: ["AI analysis unavailable"],
            explanation:
              "Please configure API key for full AI-powered analysis. Limited offline checking performed.",
            action_recommended:
              "Configure the app with an API key for complete scam detection.",
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
          if (claudeResult.verdict === "scam") {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
          } else if (claudeResult.verdict === "likely_legitimate") {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        } else if (!offlineResult) {
          // API failed and no offline result
          throw new Error("Analysis failed");
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);

      // If we don't have an offline result, show error
      if (!result) {
        Alert.alert(
          "Analysis Error",
          "Could not analyze the message. Please check your internet connection and try again."
        );
      }
    } finally {
      setLoading(false);
      // Stop pulse animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [message, pulseAnim]);

  return (
    <LinearGradient
      colors={GradientColors.backgroundVibrant}
      style={styles.gradientBackground}
      locations={[0, 0.4, 0.7, 1]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <Animated.View
            style={[styles.header, { opacity: fadeAnim }]}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Scam Shield Scanner"
          >
            <LinearGradient
              colors={[Colors.primary, Colors.purple, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
              accessible={false}
            >
              <MaterialIcons name="security" size={48} color="#FFFFFF" />
            </LinearGradient>
            <Text
              style={styles.title}
              accessibilityRole="text"
            >
              Scan Suspicious Messages
            </Text>
            <Text
              style={styles.subtitle}
              accessibilityRole="text"
            >
              Paste or type any suspicious text message to check if it's a scam
            </Text>
          </Animated.View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            {/* Quick Paste Button */}
            {hasClipboardContent && !message && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={styles.pasteButtonContainer}
                  onPress={pasteFromClipboard}
                  activeOpacity={0.9}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Paste from clipboard"
                  accessibilityHint="Pastes text from your clipboard into the message input"
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.cyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pasteButton}
                  >
                    <Ionicons name="clipboard" size={24} color="#FFFFFF" />
                    <Text style={styles.pasteButtonText}>Paste from Clipboard</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Text Input with Glass Effect */}
            <BlurView intensity={20} tint="light" style={styles.inputBlurContainer}>
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
                  accessible={true}
                  accessibilityLabel="Message input"
                  accessibilityHint="Enter or paste the suspicious message you want to analyze. Maximum 2000 characters."
                  accessibilityValue={{ text: message || "Empty" }}
                />

                {/* Character count and clear button */}
                <View style={styles.inputFooter}>
                  <LinearGradient
                    colors={charCount > 1800 ? [Colors.warning, Colors.dangerLight] : [Colors.primary, Colors.cyan]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.charCountBadge}
                    accessible={false}
                  >
                    <Text
                      style={styles.charCount}
                      accessible={true}
                      accessibilityRole="text"
                      accessibilityLabel={`Character count: ${charCount} of 2000 characters`}
                    >
                      {charCount} / 2000
                    </Text>
                  </LinearGradient>
                  {message.length > 0 && (
                    <TouchableOpacity
                      onPress={clearMessage}
                      style={styles.clearButton}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clear message"
                      accessibilityHint="Clears the current message from the input field"
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </BlurView>

            {/* Analyze Button */}
            <Animated.View style={{ transform: [{ scale: loading ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                style={styles.analyzeButtonContainer}
                onPress={analyzeMessage}
                disabled={!message.trim() || loading}
                activeOpacity={0.9}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={loading ? "Analyzing message" : "Analyze message"}
                accessibilityHint={!message.trim() ? "Enter a message first to analyze" : "Analyzes the message for scam indicators using AI"}
                accessibilityState={{ disabled: !message.trim() || loading, busy: loading }}
              >
                <LinearGradient
                  colors={
                    !message.trim() || loading
                      ? [Colors.textMuted, Colors.textLight]
                      : [Colors.primary, Colors.purple, Colors.pink]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.analyzeButton,
                    (!message.trim() || loading) && styles.analyzeButtonDisabled,
                  ]}
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
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultsSection}>
            <ResultCard result={result} message={message} />
          </View>
        )}

          {/* Tips Section (when no result) */}
          {!result && !loading && (
            <BlurView
              intensity={15}
              tint="light"
              style={styles.tipsSectionBlur}
              accessible={true}
              accessibilityRole="summary"
              accessibilityLabel="Common scam warning signs"
            >
              <View style={styles.tipsSection}>
                <LinearGradient
                  colors={[Colors.warning, Colors.dangerLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tipsTitleGradient}
                  accessible={false}
                >
                  <Text
                    style={styles.tipsTitle}
                    accessibilityRole="header"
                  >
                    Common Scam Signs:
                  </Text>
                </LinearGradient>
                <View
                  style={styles.tipItem}
                  accessible={true}
                  accessibilityRole="text"
                >
                  <MaterialIcons name="warning" size={20} color={Colors.warning} />
                  <Text style={styles.tipText}>Urgent language & threats</Text>
                </View>
                <View
                  style={styles.tipItem}
                  accessible={true}
                  accessibilityRole="text"
                >
                  <MaterialIcons name="link" size={20} color={Colors.warning} />
                  <Text style={styles.tipText}>Suspicious shortened URLs</Text>
                </View>
                <View
                  style={styles.tipItem}
                  accessible={true}
                  accessibilityRole="text"
                >
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color={Colors.warning}
                  />
                  <Text style={styles.tipText}>Requests for immediate payment</Text>
                </View>
                <View
                  style={styles.tipItem}
                  accessible={true}
                  accessibilityRole="text"
                >
                  <MaterialIcons name="error" size={20} color={Colors.warning} />
                  <Text style={styles.tipText}>Poor grammar & spelling</Text>
                </View>
              </View>
            </BlurView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 30,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 20,
  },
  pasteButtonContainer: {
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  pasteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  inputBlurContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainer: {
    backgroundColor: Colors.glassWhiteLight,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    maxHeight: 200,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  charCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  clearButton: {
    padding: 4,
  },
  analyzeButtonContainer: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  resultsSection: {
    marginTop: 20,
  },
  tipsSectionBlur: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 30,
    borderWidth: 1,
    borderColor: Colors.glassBorderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tipsSection: {
    backgroundColor: Colors.glassWhiteLight,
    padding: 20,
  },
  tipsTitleGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 10,
    borderRadius: 10,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
    fontWeight: "500",
  },
});
