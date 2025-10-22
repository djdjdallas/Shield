// ResultCard component - displays analysis results with clear visual indicators
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Component to display the analysis results
export default function ResultCard({ result, message }) {
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
  const shareResults = async () => {
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
  };

  return (
    <View style={styles.container}>
      {/* Main Verdict Card */}
      <View
        style={[
          styles.verdictCard,
          { backgroundColor: getVerdictBackgroundColor() },
        ]}
      >
        {/* Verdict Header */}
        <View style={styles.verdictHeader}>
          <FontAwesome5
            name={getVerdictIcon()}
            size={48}
            color={getVerdictColor()}
          />
          <Text style={[styles.verdictText, { color: getVerdictColor() }]}>
            {getVerdictText()}
          </Text>
        </View>

        {/* Confidence Meter */}
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence Level</Text>
          <View style={styles.confidenceMeter}>
            <View
              style={[
                styles.confidenceFill,
                {
                  width: `${result.confidence}%`,
                  backgroundColor: getVerdictColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>{result.confidence}%</Text>
        </View>

        {/* Risk Level Badge */}
        {result.risk_level && (
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getVerdictColor() },
            ]}
          >
            <Text style={styles.riskBadgeText}>
              {result.risk_level.toUpperCase()} RISK
            </Text>
          </View>
        )}
      </View>

      {/* Explanation Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="info" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Analysis Summary</Text>
        </View>
        <Text style={styles.explanationText}>{result.explanation}</Text>
      </View>

      {/* Red Flags / Reasons Section */}
      {result.reasons && result.reasons.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="flag" size={20} color={Colors.danger} />
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
      )}

      {/* Detected Tactics (if available) */}
      {result.detected_tactics && result.detected_tactics.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="psychology" size={20} color={Colors.warning} />
            <Text style={styles.sectionTitle}>Tactics Used</Text>
          </View>
          {result.detected_tactics.map((tactic, index) => (
            <View key={index} style={styles.tacticChip}>
              <Text style={styles.tacticText}>{tactic}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommended Action */}
      <View style={styles.actionSection}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="recommend" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>What To Do Next</Text>
        </View>
        <Text style={styles.actionText}>{result.action_recommended}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareResults}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Share Warning</Text>
        </TouchableOpacity>

        {/* Report Button (placeholder for future functionality) */}
        {result.verdict === 'scam' && (
          <TouchableOpacity
            style={[styles.reportButton]}
            onPress={() => {
              // Future: Implement reporting to authorities
              alert('Reporting feature coming soon!');
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="report" size={20} color={Colors.danger} />
            <Text style={[styles.buttonText, { color: Colors.danger }]}>
              Report Scam
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Offline indicator */}
      {result.isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={16} color={Colors.textMuted} />
          <Text style={styles.offlineText}>
            Offline analysis - Connect to internet for full AI-powered scan
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  verdictCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  verdictHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  verdictText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  confidenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  confidenceMeter: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
  tacticChip: {
    backgroundColor: Colors.suspiciousBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tacticText: {
    fontSize: 12,
    color: Colors.warning,
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  actionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  offlineText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 8,
  },
});