import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBadge } from '../ui/StatusBadge';
import { COLORS } from '../../constants/colors';
import type { Solo } from '../../types';

interface Props { solo: Solo }

function qualidadeColor(q: number): string {
  if (q < 35) return COLORS.critico;
  if (q < 65) return COLORS.atencao;
  return COLORS.border;
}

export function SoloQualidadeCard({ solo }: Props) {
  const borderColor = qualidadeColor(solo.qualidade);
  return (
    <View style={[styles.card, { borderColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Solo</Text>
        <StatusBadge value={solo.qualidade} />
      </View>
      <View style={styles.row}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{solo.qualidade}</Text>
          <Text style={styles.metricLabel}>Qualidade</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{solo.ph.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>pH</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{solo.umidade.toFixed(0)}%</Text>
          <Text style={styles.metricLabel}>Umidade</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  metricBox: { alignItems: 'center' },
  metricValue: { color: COLORS.ciano, fontSize: 18, fontWeight: 'bold' },
  metricLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
});
