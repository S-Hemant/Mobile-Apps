import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from './Gradient';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
  noPadding?: boolean;
  variant?: 'default' | 'elevated' | 'subtle';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  glowColor,
  noPadding = false,
  variant = 'default',
}) => {
  const { isDark } = useTheme();

  const bgOpacity =
    variant === 'elevated' ? (isDark ? 0.13 : 0.92) :
    variant === 'subtle'   ? (isDark ? 0.05 : 0.6) :
                             (isDark ? 0.09 : 0.88);

  const bgColor = isDark
    ? `rgba(255, 255, 255, ${bgOpacity})`
    : `rgba(255, 255, 255, ${bgOpacity})`;

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.18)'
    : 'rgba(200, 180, 255, 0.35)';

  const innerHighlight = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.95)';

  return (
    <View
      style={[
        styles.wrapper,
        glowColor && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 20,
          elevation: 12,
        },
        !glowColor && (isDark ? styles.defaultShadowDark : styles.defaultShadowLight),
        style,
      ]}
    >
      {/* Outer border layer */}
      <View style={[styles.card, { borderColor }]}>
        {/* Glass background with subtle gradient */}
        <LinearGradient
          colors={[innerHighlight, bgColor, bgColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Inner top-edge highlight line */}
        <View style={[styles.topHighlight, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)' }]} />

        {/* Content */}
        <View style={[!noPadding && styles.padding]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
  },
  padding: {
    padding: 18,
  },
  defaultShadowDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  defaultShadowLight: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
});

export default GlassCard;
