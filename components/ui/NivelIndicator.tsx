import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface Props {
  symbol: string;
  value: number; // 0–100
  color: string;
}

export function NivelIndicator({ symbol, value, color }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { height: `${clamped}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.symbol, { color }]}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 28 },
  track: {
    width: 10,
    height: 40,
    backgroundColor: COLORS.highlight,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 5 },
  symbol: { fontSize: 9, fontWeight: 'bold', marginTop: 3 },
});
