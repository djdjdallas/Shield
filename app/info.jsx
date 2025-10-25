// Info screen - educates users about scams and how the app works
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { GradientColors } from '../constants/glassStyles';

export default function InfoScreen() {
  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <LinearGradient
      colors={GradientColors.backgroundVibrant}
      style={styles.gradientBackground}
      locations={[0, 0.4, 0.7, 1]}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      {/* How It Works Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="info" size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>How It Works</Text>
        </View>

        <BlurView intensity={20} tint="light" style={styles.cardBlur}>
          <View style={styles.card}>
            <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Copy Suspicious Message</Text>
              <Text style={styles.stepDescription}>
                When you receive a suspicious text, copy it to your clipboard
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Paste & Analyze</Text>
              <Text style={styles.stepDescription}>
                Open Scam Shield and paste the message for instant analysis
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get AI-Powered Results</Text>
              <Text style={styles.stepDescription}>
                Claude AI analyzes patterns, language, and tactics to identify scams
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.success }]}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Stay Protected</Text>
              <Text style={styles.stepDescription}>
                Follow the recommended actions to keep yourself safe
              </Text>
            </View>
          </View>
          </View>
        </BlurView>
      </View>

      {/* Common Scam Types */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome5 name="exclamation-triangle" size={20} color={Colors.warning} />
          <Text style={styles.sectionTitle}>Common Scam Types</Text>
        </View>

        <View style={styles.scamTypeCard}>
          <View style={styles.scamTypeHeader}>
            <MaterialIcons name="local-shipping" size={24} color={Colors.danger} />
            <Text style={styles.scamTypeTitle}>Package Delivery Scams</Text>
          </View>
          <Text style={styles.scamDescription}>
            Fake messages from USPS, FedEx, or UPS claiming you have an undelivered package
          </Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example:</Text>
            <Text style={styles.exampleText}>
              "USPS: Your package is pending delivery. Pay $1.99 shipping fee: [suspicious link]"
            </Text>
          </View>
        </View>

        <View style={styles.scamTypeCard}>
          <View style={styles.scamTypeHeader}>
            <FontAwesome5 name="road" size={24} color={Colors.danger} />
            <Text style={styles.scamTypeTitle}>Toll Road Scams</Text>
          </View>
          <Text style={styles.scamDescription}>
            Messages claiming you owe unpaid tolls, often with specific amounts like $11.69
          </Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example:</Text>
            <Text style={styles.exampleText}>
              "E-ZPass: Unpaid toll of $12.51. Pay now to avoid $50 late fee: [link]"
            </Text>
          </View>
        </View>

        <View style={styles.scamTypeCard}>
          <View style={styles.scamTypeHeader}>
            <MaterialIcons name="account-balance" size={24} color={Colors.danger} />
            <Text style={styles.scamTypeTitle}>Bank/Credit Card Scams</Text>
          </View>
          <Text style={styles.scamDescription}>
            Fake alerts about suspicious activity or account locks requiring immediate action
          </Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example:</Text>
            <Text style={styles.exampleText}>
              "Chase Bank: Suspicious activity detected. Verify account immediately: [link]"
            </Text>
          </View>
        </View>

        <View style={styles.scamTypeCard}>
          <View style={styles.scamTypeHeader}>
            <Entypo name="trophy" size={24} color={Colors.danger} />
            <Text style={styles.scamTypeTitle}>Prize/Lottery Scams</Text>
          </View>
          <Text style={styles.scamDescription}>
            Claims you've won money or prizes but need to pay fees or provide information
          </Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example:</Text>
            <Text style={styles.exampleText}>
              "Congratulations! You've won $1,000,000! Click here to claim your prize"
            </Text>
          </View>
        </View>
      </View>

      {/* Red Flags to Watch For */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="flag" size={24} color={Colors.danger} />
          <Text style={styles.sectionTitle}>Red Flags to Watch For</Text>
        </View>

        <View style={styles.card}>
          {[
            { icon: 'timer', text: 'Urgent language and artificial deadlines' },
            { icon: 'link', text: 'Shortened URLs (bit.ly, tinyurl)' },
            { icon: 'attach-money', text: 'Requests for immediate payment' },
            { icon: 'error', text: 'Poor grammar and spelling mistakes' },
            { icon: 'phone-android', text: 'Generic greetings ("Dear customer")' },
            { icon: 'warning', text: 'Threats of account closure or legal action' },
            { icon: 'security', text: 'Requests for passwords or personal info' },
            { icon: 'email', text: 'Sender address doesn\'t match company' },
          ].map((item, index) => (
            <View key={index} style={styles.flagItem}>
              <MaterialIcons name={item.icon} size={20} color={Colors.warning} />
              <Text style={styles.flagText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Safety Tips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="shield" size={24} color={Colors.success} />
          <Text style={styles.sectionTitle}>How to Stay Safe</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1.</Text>
            <Text style={styles.tipText}>
              Never click links in suspicious messages - go directly to the company's website
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2.</Text>
            <Text style={styles.tipText}>
              Verify sender by contacting the company through official channels
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3.</Text>
            <Text style={styles.tipText}>
              Don't provide personal information via text message
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>4.</Text>
            <Text style={styles.tipText}>
              Report scams to authorities and warn friends/family
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>5.</Text>
            <Text style={styles.tipText}>
              Enable spam filters on your phone when available
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>6.</Text>
            <Text style={styles.tipText}>
              If it seems too good to be true, it probably is
            </Text>
          </View>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart" size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>The Scam Problem</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statHighlight}>$1 Billion+</Text>
          <Text style={styles.statDescription}>
            Lost to text message scams in the past 3 years
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statHighlight}>87%</Text>
          <Text style={styles.statDescription}>
            Of Americans have received scam texts
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statHighlight}>1 in 3</Text>
          <Text style={styles.statDescription}>
            People have clicked on a scam link
          </Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="info-outline" size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>About Scam Shield</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Scam Shield uses advanced AI technology powered by Claude (Anthropic) to analyze text messages and identify potential scams. Our mission is to protect people from the billion-dollar text scam epidemic.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
          <Text style={styles.privacyText}>
            • Messages are analyzed anonymously{'\n'}
            • We don't store personal information{'\n'}
            • Analysis history is stored locally on your device{'\n'}
            • No message content is shared with third parties
          </Text>
        </View>
      </View>

      {/* Resources */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="link" size={24} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Report Scams</Text>
        </View>

        <TouchableOpacity
          style={styles.resourceButton}
          onPress={() => openLink('https://reportfraud.ftc.gov/')}
        >
          <Text style={styles.resourceTitle}>FTC Report Fraud</Text>
          <MaterialIcons name="arrow-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resourceButton}
          onPress={() => openLink('https://www.ic3.gov/')}
        >
          <Text style={styles.resourceTitle}>FBI Internet Crime Complaint Center</Text>
          <MaterialIcons name="arrow-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resourceButton}
          onPress={() => openLink('https://www.consumer.ftc.gov/features/feature-0038-onguardonline')}
        >
          <Text style={styles.resourceTitle}>Consumer Protection Resources</Text>
          <MaterialIcons name="arrow-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Stay vigilant. Stay safe. Use Scam Shield.
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
  },
  cardBlur: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    backgroundColor: Colors.glassWhiteLight,
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  scamTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  scamTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scamTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
  },
  scamDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 10,
  },
  exampleBox: {
    backgroundColor: Colors.scamBackground,
    padding: 12,
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 13,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 10,
    width: 20,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  statHighlight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 15,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  resourceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});