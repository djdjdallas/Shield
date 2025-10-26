import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, memo } from 'react';
import { getSettings, saveSettings, clearHistory, exportHistory } from '../utils/storage';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoCheckClipboard: true,
    saveHistory: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const loaded = await getSettings();
    setSettings(loaded);
  }

  const updateSetting = useCallback(async (key, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings]);

  const handleClearHistory = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const success = await clearHistory();
            if (success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Scan history cleared');
            }
          },
        },
      ]
    );
  }, []);

  const handleExportHistory = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const jsonData = await exportHistory();
    if (jsonData) {
      try {
        await Share.share({
          message: jsonData,
          title: 'Defendr History Export',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        Alert.alert('Error', 'Could not export history');
      }
    } else {
      Alert.alert('Error', 'No history to export');
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <BlurView intensity={20} tint="light" style={styles.header}>
          <MaterialIcons name="settings" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Settings</Text>
        </BlurView>

        {/* App Settings Section */}
        <SettingsSection title="App Settings">
          <SettingToggle
            icon="notifications"
            title="Notifications"
            description="Get alerts for suspicious activity"
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
          />
          <SettingToggle
            icon="content-paste"
            title="Auto-Check Clipboard"
            description="Automatically detect text copied to clipboard"
            value={settings.autoCheckClipboard}
            onValueChange={(value) => updateSetting('autoCheckClipboard', value)}
          />
          <SettingToggle
            icon="history"
            title="Save Scan History"
            description="Store scans locally on your device"
            value={settings.saveHistory}
            onValueChange={(value) => updateSetting('saveHistory', value)}
          />
          <SettingToggle
            icon="dark-mode"
            title="Dark Mode (Coming Soon)"
            description="Enable dark theme"
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
            disabled={true}
          />
        </SettingsSection>

        {/* Data Management Section */}
        <SettingsSection title="Data Management">
          <SettingButton
            icon="file-upload"
            title="Export History"
            description="Save your scan history as JSON"
            onPress={handleExportHistory}
          />
          <SettingButton
            icon="delete-sweep"
            title="Clear History"
            description="Delete all saved scans"
            onPress={handleClearHistory}
            destructive
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingInfo
            icon="info"
            title="Version"
            value={Constants.expoConfig?.version || '1.0.0'}
          />
          <SettingInfo
            icon="security"
            title="Privacy"
            value="Data stored locally"
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Defendr {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={styles.footerSubtext}>
            Protecting you from digital threats
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable Settings Section Component
const SettingsSection = memo(function SettingsSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <BlurView intensity={15} tint="light" style={styles.sectionCard}>
        {children}
      </BlurView>
    </View>
  );
});

// Toggle Setting Component
function SettingToggle({ icon, title, description, value, onValueChange, disabled }) {
  return (
    <View
      style={styles.settingRow}
      accessible={true}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#8B5CF6' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        disabled={disabled}
        style={styles.switch}
        accessible={false}
      />
    </View>
  );
}

// Button Setting Component
function SettingButton({ icon, title, description, onPress, destructive }) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View style={[styles.settingIcon, destructive && styles.destructiveIcon]}>
        <MaterialIcons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
    </TouchableOpacity>
  );
}

// Info Setting Component
const SettingInfo = memo(function SettingInfo({ icon, title, value }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 250,
    height: 250,
    top: -80,
    right: -80,
  },
  circle2: {
    width: 180,
    height: 180,
    bottom: 100,
    left: -60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#FCA5A5',
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  switch: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
