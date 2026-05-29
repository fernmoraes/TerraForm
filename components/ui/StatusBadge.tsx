import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface Props {
  value: number; // 0–100
}

function getStatus(v: number): { label: string; color: string } {
  if (v >= 65) return { label: 'Ótimo', color: COLORS.verde };
  if (v >= 35) return { label: 'Atenção', color: COLORS.atencao };
  return { label: 'Crítico', color: COLORS.critico };
}

export function StatusBadge({ value }: Props) {
  const { label, color } = getStatus(value);
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: { fontSize: 11, fontWeight: '600' },
});
