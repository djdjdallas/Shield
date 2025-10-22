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
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
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

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => {
          // Future: Navigate to detail view
          Alert.alert(
            'Scan Details',
            `Message: ${message}\n\nVerdict: ${result.verdict}\nConfidence: ${result.confidence}%\nExplanation: ${result.explanation}`
          );
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Verdict Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getVerdictColor(result.verdict)}20` },
            ]}
          >
            <FontAwesome5
              name={getVerdictIcon(result.verdict)}
              size={24}
              color={getVerdictColor(result.verdict)}
            />
          </View>

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
              <Text style={styles.confidenceText}>
                {result.confidence}% confidence
              </Text>
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
            <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
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
        <View style={[styles.statCard, { backgroundColor: Colors.scamBackground }]}>
          <Text style={[styles.statNumber, { color: Colors.danger }]}>
            {statistics.scamsDetected || 0}
          </Text>
          <Text style={styles.statLabel}>Scams Detected</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.suspiciousBackground }]}>
          <Text style={[styles.statNumber, { color: Colors.warning }]}>
            {statistics.suspiciousCount || 0}
          </Text>
          <Text style={styles.statLabel}>Suspicious</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.safeBackground }]}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>
            {statistics.safeCount || 0}
          </Text>
          <Text style={styles.statLabel}>Safe</Text>
        </View>
      </View>

      {/* Total scans and clear button */}
      <View style={styles.headerActions}>
        <Text style={styles.totalScans}>
          Total Scans: {statistics.totalScans || 0}
        </Text>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <MaterialIcons name="delete-sweep" size={20} color={Colors.danger} />
            <Text style={styles.clearButtonText}>Clear All</Text>
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalScans: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  clearButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  verdictText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  deleteButton: {
    padding: 8,
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