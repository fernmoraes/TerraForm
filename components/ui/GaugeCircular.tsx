import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface Props {
  value: number;   // 0–100
  color: string;
  size?: number;
  label?: string;
  showValue?: boolean;
}

export function GaugeCircular({ value, color, size = 64, label, showValue = true }: Props) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference * (1 - clamped / 100);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx} cy={cy} r={radius}
            stroke={COLORS.highlight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={cx} cy={cy} r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {showValue && (
        <View style={[StyleSheet.absoluteFill, styles.valueContainer]}>
          <Text style={[styles.value, { color }]}>{Math.round(clamped)}</Text>
        </View>
      )}
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  valueContainer: { justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 13, fontWeight: 'bold' },
  label: { color: COLORS.textSecondary, fontSize: 10, marginTop: 2, textAlign: 'center' },
});
