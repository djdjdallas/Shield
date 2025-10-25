// Glassmorphism design system utilities
import { StyleSheet } from 'react-native';

// Glass effect constants
export const GlassEffects = {
  // Blur intensities
  blur: {
    light: 10,
    medium: 20,
    heavy: 40,
  },

  // Transparency levels (0-1)
  opacity: {
    subtle: 0.1,
    light: 0.2,
    medium: 0.4,
    heavy: 0.6,
  },

  // Border widths
  borderWidth: {
    thin: 0.5,
    medium: 1,
    thick: 1.5,
  },

  // Shadow depths
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

// Pre-defined glass card styles
export const glassCardStyles = StyleSheet.create({
  // Basic glass card
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...GlassEffects.shadow.medium,
  },

  // Glass card with more transparency
  glassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...GlassEffects.shadow.small,
  },

  // Solid glass card (less transparent)
  glassSolid: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...GlassEffects.shadow.large,
  },

  // Dark glass card (for dark backgrounds)
  glassDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...GlassEffects.shadow.medium,
  },

  // Colored glass variants
  glassBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    ...GlassEffects.shadow.medium,
  },

  glassPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    ...GlassEffects.shadow.medium,
  },

  glassCyan: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    ...GlassEffects.shadow.medium,
  },

  glassRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    ...GlassEffects.shadow.medium,
  },

  glassGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    ...GlassEffects.shadow.medium,
  },

  glassAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    ...GlassEffects.shadow.medium,
  },
});

// Gradient color stops for LinearGradient
export const GradientColors = {
  // Primary gradients
  bluePurple: ['#3B82F6', '#8B5CF6', '#EC4899'],
  blueIndigo: ['#06B6D4', '#3B82F6', '#6366F1'],
  purplePink: ['#8B5CF6', '#C026D3', '#EC4899'],

  // Background gradients
  background: ['#F0F9FF', '#E0E7FF', '#F3E8FF'],
  backgroundDark: ['#1E1B4B', '#312E81', '#3730A3'],
  backgroundVibrant: ['#DBEAFE', '#E0E7FF', '#FAE8FF', '#FCE7F3'],

  // Status gradients
  danger: ['#FCA5A5', '#EF4444', '#DC2626'],
  warning: ['#FCD34D', '#F59E0B', '#D97706'],
  success: ['#6EE7B7', '#10B981', '#059669'],

  // Accent gradients
  sunset: ['#FDE68A', '#FCA5A5', '#C084FC'],
  ocean: ['#BAE6FD', '#7DD3FC', '#38BDF8'],
  aurora: ['#C7D2FE', '#A78BFA', '#E9D5FF'],
  neon: ['#2DD4BF', '#06B6D4', '#0EA5E9'],
};

// Shimmer/glow effect configuration
export const ShimmerConfig = {
  colors: [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 0.3)',
    'rgba(255, 255, 255, 0)',
  ],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

// Animation durations (milliseconds)
export const AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  pulse: 1500,
  shimmer: 2000,
};

// Helper function to create custom glass style
export const createGlassStyle = ({
  opacity = 0.15,
  borderOpacity = 0.2,
  borderWidth = 1,
  borderRadius = 16,
  shadowSize = 'medium',
  color = 'rgba(255, 255, 255, 1)',
} = {}) => {
  // Parse RGB from color if it's in rgba format, otherwise default to white
  const baseColor = color.includes('rgba')
    ? color.replace('rgba(', '').replace(')', '').split(',').slice(0, 3).join(',')
    : '255, 255, 255';

  return {
    backgroundColor: `rgba(${baseColor}, ${opacity})`,
    borderRadius,
    borderWidth,
    borderColor: `rgba(${baseColor}, ${borderOpacity})`,
    ...GlassEffects.shadow[shadowSize],
  };
};

// Helper function to get gradient colors by theme
export const getGradientByVerdict = (verdict) => {
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
