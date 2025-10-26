import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const { width, height } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Protect Yourself\nFrom Scams',
    description: 'AI-powered scam detection to keep you safe from fraudulent messages and suspicious links',
    emoji: '🛡️',
    gradient: ['#4158D0', '#C850C0'],
  },
  {
    id: 2,
    title: 'Instant Analysis\nIn Seconds',
    description: 'Paste any message and get real-time analysis with confidence scores and risk levels',
    emoji: '⚡',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 3,
    title: 'Smart Pattern\nDetection',
    description: 'Our AI recognizes common scam tactics like urgency, suspicious URLs, and impersonation',
    emoji: '🧠',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 4,
    title: 'Track Your\nProtection',
    description: 'View your scan history and statistics. Stay informed about threats you\'ve avoided',
    emoji: '📊',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: 5,
    title: 'Enable\nClipboard Access',
    description: 'Allow clipboard access to quickly paste messages for analysis. You stay in control!',
    emoji: '📋',
    gradient: ['#fa709a', '#fee140'],
    isPermission: true,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleRequestPermission = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Request clipboard permission by attempting to read
      await Clipboard.getStringAsync();
      setPermissionGranted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Clipboard permission not granted', error);
      // Still allow user to continue
      setPermissionGranted(true);
    }
  };

  const handleNext = () => {
    const currentSlide = ONBOARDING_SLIDES[currentIndex];

    // If on permission slide and permission not requested yet, request it
    if (currentSlide.isPermission && !permissionGranted) {
      handleRequestPermission();
      return;
    }

    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(currentIndex + 1);
        slideAnim.setValue(50);

        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleComplete();
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onComplete) {
      onComplete();
    }
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      {/* Animated gradient background */}
      <LinearGradient
        colors={currentSlide.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Top decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* Skip button */}
      {currentIndex < ONBOARDING_SLIDES.length - 1 && (
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Skips the onboarding and starts using the app"
        >
          <BlurView intensity={20} tint="light" style={styles.skipBlur}>
            <Text style={styles.skipText}>Skip</Text>
          </BlurView>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Emoji */}
        <View style={styles.emojiContainer}>
          <BlurView intensity={30} tint="light" style={styles.emojiBlur}>
            <Text style={styles.emoji}>{currentSlide.emoji}</Text>
          </BlurView>
        </View>

        {/* Title */}
        <BlurView intensity={20} tint="light" style={styles.titleCard}>
          <Text style={styles.title}>{currentSlide.title}</Text>
        </BlurView>

        {/* Description */}
        <BlurView intensity={15} tint="light" style={styles.descriptionCard}>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </BlurView>
      </Animated.View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started/Grant Permission button */}
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            currentSlide.isPermission && !permissionGranted
              ? 'Grant clipboard access'
              : currentIndex === ONBOARDING_SLIDES.length - 1
              ? 'Get started with Scam Shield'
              : 'Next slide'
          }
          accessibilityHint={
            currentSlide.isPermission && !permissionGranted
              ? 'Requests permission to access clipboard for pasting messages'
              : currentIndex === ONBOARDING_SLIDES.length - 1
              ? 'Completes onboarding and opens the app'
              : 'Proceeds to the next onboarding slide'
          }
        >
          <BlurView intensity={30} tint="light" style={styles.nextBlur}>
            <LinearGradient
              colors={
                currentSlide.isPermission && !permissionGranted
                  ? ['rgba(139, 92, 246, 0.5)', 'rgba(99, 102, 241, 0.5)']
                  : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']
              }
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {currentSlide.isPermission && !permissionGranted
                  ? '✓ Grant Access'
                  : currentIndex === ONBOARDING_SLIDES.length - 1
                  ? 'Get Started'
                  : 'Next'}
              </Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    top: height * 0.3,
    left: -80,
  },
  circle3: {
    width: 150,
    height: 150,
    bottom: height * 0.2,
    right: -50,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emojiContainer: {
    marginBottom: 40,
  },
  emojiBlur: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emoji: {
    fontSize: 72,
  },
  titleCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  descriptionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    maxWidth: 340,
  },
  description: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  bottomSection: {
    paddingBottom: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  nextButton: {
    width: '100%',
  },
  nextBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  nextGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
