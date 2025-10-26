// Custom Glassmorphic Splash Screen
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { GradientColors, AnimationDurations } from '../constants/glassStyles';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Start pulsing
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start();

    // Auto-hide after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={GradientColors.backgroundVibrant}
        style={styles.gradient}
        locations={[0, 0.3, 0.6, 1]}
      >
        {/* Shimmer effect overlay */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.3)',
              'rgba(255, 255, 255, 0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>

        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glass shield container */}
          <Animated.View
            style={[
              styles.iconOuterContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.purple, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradientBorder}
            >
              <BlurView intensity={30} tint="light" style={styles.iconBlur}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="security" size={120} color="#FFFFFF" />
                </View>
              </BlurView>
            </LinearGradient>
          </Animated.View>

          {/* App name with gradient */}
          <LinearGradient
            colors={[Colors.primary, Colors.purple, Colors.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>Defendr</Text>
          </LinearGradient>

          {/* Tagline */}
          <BlurView intensity={20} tint="light" style={styles.taglineBlur}>
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>AI-Powered Scam Detection</Text>
            </View>
          </BlurView>

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadingBar}
            >
              <Animated.View
                style={[
                  styles.loadingProgress,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Bottom branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Claude AI</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: width * 2,
    height: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuterContainer: {
    marginBottom: 40,
  },
  iconGradientBorder: {
    padding: 4,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  iconBlur: {
    borderRadius: 96,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: Colors.glassWhiteLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  taglineBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: 40,
  },
  taglineContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.glassWhiteLight,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
  },
  loadingBar: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    opacity: 0.7,
  },
});
