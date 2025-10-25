// History screen - displays past scan results
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { GradientColors } from '../constants/glassStyles';
import {
  getScanHistory,
  deleteHistoryItem,
  clearHistory,
  getStatistics,
} from '../utils/storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load history when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const [historyData, stats] = await Promise.all([
        getScanHistory(),
        getStatistics(),
      ]);
      setHistory(historyData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this scan from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHistoryItem(item.id);
            if (success) {
              loadHistory();
            }
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearHistory();
            if (success) {
              loadHistory();
            }
          },
        },
      ]
    );
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
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

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    // Format as date if older than a week
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderHistoryItem = ({ item }) => {
    const { result, message, timestamp } = item;

    const getVerdictGradient = (verdict) => {
      switch (verdict) {
        case 'scam':
          return GradientColors.danger;
        case 'suspicious':
          return GradientColors.warning;
        case 'likely_legitimate':
          return GradientColors.success;
        default:
          return GradientColors.bluePurple;
      }
    };

    return (
      <TouchableOpacity
        style={styles.historyCardContainer}
        onPress={() => {
          // Future: Navigate to detail view
          Alert.alert(
            'Scan Details',
            `Message: ${message}\n\nVerdict: ${result.verdict}\nConfidence: ${result.confidence}%\nExplanation: ${result.explanation}`
          );
        }}
        activeOpacity={0.9}
      >
        <BlurView intensity={20} tint="light" style={styles.historyCard}>
          <View style={styles.cardContent}>
            {/* Verdict Icon with Gradient */}
            <LinearGradient
              colors={getVerdictGradient(result.verdict)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <FontAwesome5
                name={getVerdictIcon(result.verdict)}
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>

            {/* Message Content */}
            <View style={styles.messageContent}>
              <View style={styles.verdictRow}>
                <Text
                  style={[
                    styles.verdictText,
                    { color: getVerdictColor(result.verdict) },
                  ]}
                >
                  {result.verdict.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <LinearGradient
                  colors={getVerdictGradient(result.verdict)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confidenceBadge}
                >
                  <Text style={styles.confidenceText}>
                    {result.confidence}%
                  </Text>
                </LinearGradient>
              </View>

              <Text style={styles.messageText} numberOfLines={2}>
                {message}
              </Text>

              <Text style={styles.timeText}>{formatDate(timestamp)}</Text>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LinearGradient
                colors={[Colors.danger, Colors.dangerDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.deleteIconGradient}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={64} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>No Scan History</Text>
      <Text style={styles.emptyText}>
        Your scan results will appear here after you analyze messages
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={GradientColors.danger}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <BlurView intensity={20} tint="light" style={styles.statBlur}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {statistics.scamsDetected || 0}
              </Text>
              <Text style={styles.statLabel}>Scams Detected</Text>
            </View>
          </BlurView>
        </LinearGradient>

        <LinearGradient
          colors={GradientColors.warning}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <BlurView intensity={20} tint="light" style={styles.statBlur}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {statistics.suspiciousCount || 0}
              </Text>
              <Text style={styles.statLabel}>Suspicious</Text>
            </View>
          </BlurView>
        </LinearGradient>

        <LinearGradient
          colors={GradientColors.success}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <BlurView intensity={20} tint="light" style={styles.statBlur}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {statistics.safeCount || 0}
              </Text>
              <Text style={styles.statLabel}>Safe</Text>
            </View>
          </BlurView>
        </LinearGradient>
      </View>

      {/* Total scans and clear button */}
      <View style={styles.headerActions}>
        <LinearGradient
          colors={[Colors.primary, Colors.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.totalScansBadge}
        >
          <Text style={styles.totalScans}>
            Total Scans: {statistics.totalScans || 0}
          </Text>
        </LinearGradient>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButtonContainer}
            onPress={handleClearHistory}
          >
            <BlurView intensity={15} tint="light" style={styles.clearButton}>
              <MaterialIcons name="delete-sweep" size={20} color={Colors.danger} />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </BlurView>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={GradientColors.backgroundVibrant}
      style={styles.gradientBackground}
      locations={[0, 0.4, 0.7, 1]}
    >
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={history.length === 0 ? styles.emptyListContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statGradient: {
    flex: 1,
    borderRadius: 14,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCard: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: Colors.glassWhiteLight,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 4,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalScansBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  totalScans: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clearButtonContainer: {
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.glassWhiteLight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  clearButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyCardContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorderLight,
    backgroundColor: Colors.glassWhiteLight,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  messageContent: {
    flex: 1,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  messageText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});