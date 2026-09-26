import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface RingProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  unit?: string;
}

const RingProgress: React.FC<RingProgressProps> = ({
  value,
  max,
  size = 96,
  strokeWidth = 9,
  color,
  label,
  unit = '',
}) => {
  const { isDark } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Derive a lighter shade for the gradient tip
  const gradientId = `grad_${label.replace(/\s/g, '')}`;

  const displayValue =
    value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();

  const pct = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      {/* SVG ring */}
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </SvgGradient>
        </Defs>

        {/* Track ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center label */}
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.value, { color: isDark ? '#fff' : Colors.textDark }]}>
          {displayValue}
        </Text>
        {unit ? (
          <Text style={[styles.unit, { color }]}>{unit}</Text>
        ) : null}
      </View>

      {/* Bottom labels */}
      <Text style={[styles.label, { color: isDark ? 'rgba(255,255,255,0.75)' : Colors.textDarkSecondary }]}>
        {label}
      </Text>
      <View style={[styles.pctPill, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.pctText, { color }]}>{pct}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 5,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 96 + 6,
  },
  pctPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pctText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default RingProgress;
