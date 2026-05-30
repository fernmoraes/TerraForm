import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { StatusBadge } from '../ui/StatusBadge';
import { COLORS } from '../../constants/colors';
import { THRESHOLDS } from '../../constants/thresholds';
import type { Ar } from '../../types';

interface Props { ar: Ar; onPress?: () => void; }

function qualidadeColor(q: number): string {
  if (q < 35) return COLORS.critico;
  if (q < 65) return COLORS.atencao;
  return COLORS.border;
}

function o2Color(o2: number): string {
  if (o2 < THRESHOLDS.o2MinCritico) return COLORS.critico;
  if (o2 < THRESHOLDS.o2MinAtencao || o2 > THRESHOLDS.o2MaxAtencao) return COLORS.atencao;
  return COLORS.verde;
}

function co2Color(co2: number): string {
  if (co2 > THRESHOLDS.co2MaxCritico) return COLORS.critico;
  if (co2 > THRESHOLDS.co2MaxAtencao) return COLORS.atencao;
  return COLORS.verde;
}

function umidadeColor(u: number): string {
  if (u < THRESHOLDS.umidadeArMinCritico) return COLORS.critico;
  if (u < THRESHOLDS.umidadeArMinAtencao || u > THRESHOLDS.umidadeArMaxAtencao) return COLORS.atencao;
  return COLORS.verde;
}

type Metric = { value: string; label: string; ideal: string; color: string };

function MetricBox({ value, label, ideal, color }: Metric) {
  return (
    <View style={s.metricBox}>
      <Text style={[s.metricValue, { color }]}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={s.idealHint}>{ideal}</Text>
    </View>
  );
}

export function ArQualidadeCard({ ar, onPress }: Props) {
  const borderColor = qualidadeColor(ar.qualidade);
  return (
    <TouchableOpacity style={[s.card, { borderColor }]} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <View style={s.header}>
        <Text style={s.title}>Atmosfera Interna</Text>
        <StatusBadge value={ar.qualidade} />
      </View>
      <View style={s.row}>
        <MetricBox
          value={String(ar.qualidade)}
          label="Qualidade"
          ideal="ideal > 65"
          color={ar.qualidade >= 65 ? COLORS.verde : ar.qualidade >= 35 ? COLORS.atencao : COLORS.critico}
        />
        <MetricBox
          value={`${ar.o2.toFixed(1)}%`}
          label="O₂"
          ideal="ideal 19–22%"
          color={o2Color(ar.o2)}
        />
        <MetricBox
          value={`${ar.co2.toFixed(2)}%`}
          label="CO₂"
          ideal="ideal < 0.5%"
          color={co2Color(ar.co2)}
        />
        <MetricBox
          value={`${ar.umidade.toFixed(0)}%`}
          label="Umidade"
          ideal="ideal 40–70%"
          color={umidadeColor(ar.umidade)}
        />
      </View>
      {onPress && <Text style={s.hint}>Toque para controlar</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  metricBox: { alignItems: 'center' },
  metricValue: { fontSize: 15, fontWeight: 'bold' },
  metricLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  idealHint: { color: COLORS.textDim, fontSize: 9, marginTop: 3 },
  hint: { color: COLORS.ciano, fontSize: 10, textAlign: 'right', marginTop: 8, opacity: 0.7 },
});
