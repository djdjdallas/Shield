import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

/**
 * Error Boundary Component
 * Catches React errors and provides a fallback UI
 *
 * To enable Sentry integration:
 * 1. npm install @sentry/react-native
 * 2. Uncomment the Sentry lines below
 * 3. Follow SENTRY_SETUP.md for full configuration
 */

// Uncomment when Sentry is installed:
// import * as Sentry from '@sentry/react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);

    // Store error info for display
    this.setState({ errorInfo });

    // Uncomment when Sentry is set up:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack
    //     }
    //   }
    // });
  }

  handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="error-outline" size={80} color={Colors.danger} />
          </View>

          <Text style={styles.title}>Oops! Something Went Wrong</Text>

          <Text style={styles.message}>
            We've encountered an unexpected error. Don't worry, your data is safe.
          </Text>

          {/* Show error details in development */}
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
              <Text style={styles.errorText}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={this.handleReload}
            activeOpacity={0.8}
          >
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <Text style={styles.supportText}>
            If this keeps happening, please contact support
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: Colors.scamBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxHeight: 150,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 11,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
