import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface Props {
  value: number;    // 0–100
  color: string;
  height?: number;
  style?: object;
}

export function ProgressBar({ value, color, height = 6, style }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: COLORS.highlight,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: { borderRadius: 4 },
});
