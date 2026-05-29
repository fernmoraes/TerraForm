import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { StatusBadge } from '../ui/StatusBadge';
import { COLORS } from '../../constants/colors';
import type { Ar } from '../../types';

interface Props { ar: Ar; onPress?: () => void; }

function qualidadeColor(q: number): string {
  if (q < 35) return COLORS.critico;
  if (q < 65) return COLORS.atencao;
  return COLORS.border;
}

export function ArQualidadeCard({ ar, onPress }: Props) {
  const borderColor = qualidadeColor(ar.qualidade);
  return (
    <TouchableOpacity style={[styles.card, { borderColor }]} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <View style={styles.header}>
        <Text style={styles.title}>Atmosfera Interna</Text>
        <StatusBadge value={ar.qualidade} />
      </View>
      <View style={styles.row}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{ar.qualidade}</Text>
          <Text style={styles.metricLabel}>Qualidade</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{ar.o2.toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>O₂</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{ar.co2.toFixed(2)}%</Text>
          <Text style={styles.metricLabel}>CO₂</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{ar.umidade.toFixed(0)}%</Text>
          <Text style={styles.metricLabel}>Umidade</Text>
        </View>
      </View>
      {onPress && <Text style={styles.hint}>Toque para controlar</Text>}
    </TouchableOpacity>
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
  metricValue: { color: COLORS.ciano, fontSize: 16, fontWeight: 'bold' },
  metricLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  hint: { color: COLORS.ciano, fontSize: 10, textAlign: 'right', marginTop: 6, opacity: 0.7 },
});
