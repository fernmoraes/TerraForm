import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GaugeCircular } from '../ui/GaugeCircular';
import { COLORS, NUTRIENT_COLORS } from '../../constants/colors';
import { THRESHOLDS } from '../../constants/thresholds';
import type { SoloNutrienteKey } from '../../types';

const NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrog.', P: 'Fósforo', K: 'Potás.', Ca: 'Cálcio', Mg: 'Magnés.', S: 'Enxofre',
};

interface Props {
  nutriente: SoloNutrienteKey;
  value: number;
  onPress?: () => void;
}

export function NutrienteCard({ nutriente, value, onPress }: Props) {
  const color =
    value < THRESHOLDS.nutrienteCritico
      ? COLORS.critico
      : value < THRESHOLDS.nutrienteAtencao
      ? COLORS.atencao
      : NUTRIENT_COLORS[nutriente];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <GaugeCircular value={value} color={color} size={56} />
      <Text style={[styles.symbol, { color }]}>{nutriente}</Text>
      <Text style={styles.nome}>{NOMES[nutriente]}</Text>
      {onPress && <Text style={styles.hint}>toque para nutrir</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  symbol: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  nome: { color: COLORS.textSecondary, fontSize: 9, marginTop: 2 },
  hint: { color: COLORS.textDim, fontSize: 8, marginTop: 3 },
});
