import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

export interface GradientProps {
  colors: readonly string[] | string[];
  start?: { x: number; y: number } | [number, number];
  end?: { x: number; y: number } | [number, number];
  locations?: readonly number[] | number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

let gradientCounter = 0;

export const LinearGradient: React.FC<GradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  locations,
  style,
  children,
}) => {
  const gradId = React.useMemo(() => `svg_grad_${++gradientCounter}`, []);

  const x1 = Array.isArray(start) ? `${start[0] * 100}%` : `${start.x * 100}%`;
  const y1 = Array.isArray(start) ? `${start[1] * 100}%` : `${start.y * 100}%`;
  const x2 = Array.isArray(end) ? `${end[0] * 100}%` : `${end.x * 100}%`;
  const y2 = Array.isArray(end) ? `${end[1] * 100}%` : `${end.y * 100}%`;

  const colorList = Array.isArray(colors) && colors.length > 0 ? colors : ['#7C3AED', '#EC4899'];

  return (
    <View style={[styles.container, style]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id={gradId} x1={x1} y1={y1} x2={x2} y2={y2}>
            {colorList.map((color, index) => {
              const offset = locations && locations[index] !== undefined
                ? `${locations[index] * 100}%`
                : `${(index / Math.max(colorList.length - 1, 1)) * 100}%`;
              return <Stop key={index} offset={offset} stopColor={color} stopOpacity={1} />;
            })}
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
      {children}
    </View>
  );
};

export default LinearGradient;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
