// ResultCard component - displays analysis results with clear visual indicators
import React, { useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { GradientColors, getGradientByVerdict, AnimationDurations } from '../constants/glassStyles';

// Component to display the analysis results
const ResultCard = memo(function ResultCard({ result, message}) {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: AnimationDurations.slow,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate confidence bar
    Animated.timing(progressAnim, {
      toValue: result.confidence || 0,
      duration: AnimationDurations.slower,
      delay: AnimationDurations.normal,
      useNativeDriver: false,
    }).start();

    // Pulse animation for scam verdict
    if (result.verdict === 'scam') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
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
    }
  }, [result]);

  if (!result) return null;

  // Determine colors based on verdict
  const getVerdictColor = () => {
    switch (result.verdict) {
      case 'scam':
        return Colors.danger;
      case 'suspicious':
        return Colors.warning;
      case 'likely_legitimate':
        return Colors.success;
      default:
        return Colors.textLight;
    }
  };

  const getVerdictBackgroundColor = () => {
    switch (result.verdict) {
      case 'scam':
        return Colors.scamBackground;
      case 'suspicious':
        return Colors.suspiciousBackground;
      case 'likely_legitimate':
        return Colors.safeBackground;
      default:
        return Colors.background;
    }
  };

  const getVerdictIcon = () => {
    switch (result.verdict) {
      case 'scam':
        return 'shield-off';
      case 'suspicious':
        return 'warning';
      case 'likely_legitimate':
        return 'shield-check';
      default:
        return 'help-circle';
    }
  };

  const getVerdictText = () => {
    switch (result.verdict) {
      case 'scam':
        return 'SCAM DETECTED';
      case 'suspicious':
        return 'SUSPICIOUS MESSAGE';
      case 'likely_legitimate':
        return 'LIKELY SAFE';
      default:
        return 'UNKNOWN';
    }
  };

  // Share results function
  const shareResults = useCallback(async () => {
    try {
      const shareMessage = `⚠️ Scam Shield Analysis ⚠️\n\n` +
        `Verdict: ${getVerdictText()}\n` +
        `Confidence: ${result.confidence}%\n` +
        `Risk Level: ${result.risk_level?.toUpperCase()}\n\n` +
        `${result.explanation}\n\n` +
        `Recommendation: ${result.action_recommended}\n\n` +
        `Analyzed message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"\n\n` +
        `Stay safe! Download Scam Shield to protect yourself from text scams.`;

      await Share.share({
        message: shareMessage,
        title: 'Scam Analysis Result',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [result, message]);

  // Interpolate width for animated confidence bar
  const confidenceWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Scan result: ${getVerdictText()}. Confidence: ${result.confidence} percent. Risk level: ${result.risk_level}. ${result.explanation}`}
    >
      {/* Main Verdict Card with Glassmorphism */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LinearGradient
          colors={getGradientByVerdict(result.verdict)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.verdictGradientOuter}
        >
          <BlurView intensity={30} tint="light" style={styles.verdictBlur}>
            <View style={styles.verdictCard}>
              {/* Verdict Header */}
              <View style={styles.verdictHeader}>
                <LinearGradient
                  colors={getGradientByVerdict(result.verdict)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  <FontAwesome5
                    name={getVerdictIcon()}
                    size={48}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <Text style={[styles.verdictText, { color: getVerdictColor() }]}>
                  {getVerdictText()}
                </Text>
              </View>

              {/* Confidence Meter */}
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence Level</Text>
                <View style={styles.confidenceMeter}>
                  <Animated.View style={{ width: confidenceWidth }}>
                    <LinearGradient
                      colors={getGradientByVerdict(result.verdict)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.confidenceFill}
                    />
                  </Animated.View>
                </View>
                <LinearGradient
                  colors={getGradientByVerdict(result.verdict)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confidenceBadge}
                >
                  <Text style={styles.confidenceText}>{result.confidence}%</Text>
                </LinearGradient>
              </View>

              {/* Risk Level Badge */}
              {result.risk_level && (
                <LinearGradient
                  colors={getGradientByVerdict(result.verdict)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.riskBadge}
                >
                  <Text style={styles.riskBadgeText}>
                    {result.risk_level.toUpperCase()} RISK
                  </Text>
                </LinearGradient>
              )}
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      {/* Explanation Section */}
      <BlurView intensity={20} tint="light" style={styles.sectionBlur}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[Colors.primary, Colors.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionIconGradient}
            >
              <MaterialIcons name="info" size={18} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Analysis Summary</Text>
          </View>
          <Text style={styles.explanationText}>{result.explanation}</Text>
        </View>
      </BlurView>

      {/* Red Flags / Reasons Section */}
      {result.reasons && result.reasons.length > 0 && (
        <BlurView intensity={20} tint="light" style={styles.sectionBlur}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={result.verdict === 'likely_legitimate'
                  ? [Colors.success, Colors.successLight]
                  : [Colors.danger, Colors.dangerLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionIconGradient}
              >
                <MaterialIcons name="flag" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>
                {result.verdict === 'likely_legitimate' ? 'Positive Signs' : 'Red Flags Detected'}
              </Text>
            </View>
            {result.reasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <Ionicons
                  name={result.verdict === 'likely_legitimate' ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={result.verdict === 'likely_legitimate' ? Colors.success : Colors.warning}
                />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </BlurView>
      )}

      {/* Detected Tactics (if available) */}
      {result.detected_tactics && result.detected_tactics.length > 0 && (
        <BlurView intensity={20} tint="light" style={styles.sectionBlur}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[Colors.warning, Colors.warningLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionIconGradient}
              >
                <MaterialIcons name="psychology" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Tactics Used</Text>
            </View>
            <View style={styles.tacticContainer}>
              {result.detected_tactics.map((tactic, index) => (
                <LinearGradient
                  key={index}
                  colors={[Colors.warningLight, Colors.warning]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tacticChip}
                >
                  <Text style={styles.tacticText}>{tactic}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        </BlurView>
      )}

      {/* Recommended Action */}
      <BlurView intensity={25} tint="light" style={styles.actionSectionBlur}>
        <LinearGradient
          colors={[Colors.primary, Colors.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionGradientBorder}
        >
          <View style={styles.actionSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[Colors.primary, Colors.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sectionIconGradient}
              >
                <MaterialIcons name="recommend" size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>What To Do Next</Text>
            </View>
            <Text style={styles.actionText}>{result.action_recommended}</Text>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButtonContainer}
          onPress={shareResults}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Share Warning</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Report Button (placeholder for future functionality) */}
        {result.verdict === 'scam' && (
          <TouchableOpacity
            style={styles.reportButtonContainer}
            onPress={() => {
              // Future: Implement reporting to authorities
              alert('Reporting feature coming soon!');
            }}
            activeOpacity={0.9}
          >
            <BlurView intensity={15} tint="light" style={styles.reportButton}>
              <LinearGradient
                colors={[Colors.danger, Colors.dangerDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.reportIconGradient}
              >
                <MaterialIcons name="report" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.buttonText, { color: Colors.danger }]}>
                Report Scam
              </Text>
            </BlurView>
          </TouchableOpacity>
        )}
      </View>

      {/* Offline indicator */}
      {result.isOffline && (
        <BlurView intensity={10} tint="light" style={styles.offlineIndicatorBlur}>
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={16} color={Colors.textMuted} />
            <Text style={styles.offlineText}>
              Offline analysis - Connect to internet for full AI-powered scan
            </Text>
          </View>
        </BlurView>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  verdictGradientOuter: {
    borderRadius: 20,
    padding: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  verdictBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  verdictCard: {
    backgroundColor: Colors.glassWhiteLight,
    padding: 24,
    alignItems: 'center',
  },
  verdictHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  verdictText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 10,
    fontWeight: '600',
  },
  confidenceMeter: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  section: {
    backgroundColor: Colors.glassWhiteLight,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 10,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  tacticContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tacticChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tacticText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionSectionBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  actionGradientBorder: {
    padding: 2,
    borderRadius: 16,
  },
  actionSection: {
    backgroundColor: Colors.glassWhiteMedium,
    borderRadius: 14,
    padding: 16,
  },
  actionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButtonContainer: {
    flex: 1,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  reportButtonContainer: {
    flex: 1,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.glassWhiteLight,
    overflow: 'hidden',
  },
  reportIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  offlineIndicatorBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorderLight,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.glassWhiteLight,
  },
  offlineText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ResultCard;