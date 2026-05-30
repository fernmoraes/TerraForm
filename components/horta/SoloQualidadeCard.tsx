import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { StatusBadge } from '../ui/StatusBadge';
import { COLORS } from '../../constants/colors';
import { THRESHOLDS } from '../../constants/thresholds';
import type { Solo } from '../../types';

interface Props { solo: Solo; onPress?: () => void; }

function qualidadeColor(q: number): string {
  if (q < 35) return COLORS.critico;
  if (q < 65) return COLORS.atencao;
  return COLORS.border;
}

function phColor(ph: number): string {
  if (ph < THRESHOLDS.phMinCritico || ph > THRESHOLDS.phMaxCritico) return COLORS.critico;
  if (ph < THRESHOLDS.phMinAtencao || ph > THRESHOLDS.phMaxAtencao) return COLORS.atencao;
  return COLORS.verde;
}

function umidadeColor(u: number): string {
  if (u < THRESHOLDS.umidadeSoloMin) return COLORS.critico;
  if (u < THRESHOLDS.umidadeSoloAtencao) return COLORS.atencao;
  if (u > THRESHOLDS.umidadeSoloMaxAtencao) return COLORS.atencao;
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

export function SoloQualidadeCard({ solo, onPress }: Props) {
  const borderColor = qualidadeColor(solo.qualidade);
  return (
    <TouchableOpacity style={[s.card, { borderColor }]} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <View style={s.header}>
        <Text style={s.title}>Solo</Text>
        <StatusBadge value={solo.qualidade} />
      </View>
      <View style={s.row}>
        <MetricBox
          value={String(solo.qualidade)}
          label="Qualidade"
          ideal="ideal > 65"
          color={solo.qualidade >= 65 ? COLORS.verde : solo.qualidade >= 35 ? COLORS.atencao : COLORS.critico}
        />
        <MetricBox
          value={solo.ph.toFixed(1)}
          label="pH"
          ideal="ideal 6.0–7.0"
          color={phColor(solo.ph)}
        />
        <MetricBox
          value={`${solo.umidade.toFixed(0)}%`}
          label="Umidade"
          ideal="ideal 30–75%"
          color={umidadeColor(solo.umidade)}
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
  metricValue: { fontSize: 18, fontWeight: 'bold' },
  metricLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  idealHint: { color: COLORS.textDim, fontSize: 9, marginTop: 3 },
  hint: { color: COLORS.ciano, fontSize: 10, textAlign: 'right', marginTop: 8, opacity: 0.7 },
});
