import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { CustomAlert } from '../ui/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { COLORS, ATOM_COLORS } from '../../constants/colors';
import { THRESHOLDS } from '../../constants/thresholds';
import type { AtomKey } from '../../types';

const ATOM_NOMES: Record<AtomKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio', Ca: 'Cálcio',
  Mg: 'Magnésio', S: 'Enxofre', O: 'Oxigênio', H: 'Hidrogênio', C: 'Carbono',
};

interface Props {
  atomKey: AtomKey;
  value: number;
  onRepor: () => void;
}

export function GallonCard({ atomKey, value, onRepor }: Props) {
  const { alertVisible, alertTitle, alertMessage, alertButtons, showAlert, hideAlert } = useCustomAlert();

  const isCritico = value < THRESHOLDS.atomoCritico;
  const isAtencao = !isCritico && value < THRESHOLDS.atomoAtencao;
  const color = isCritico ? COLORS.critico : isAtencao ? COLORS.atencao : ATOM_COLORS[atomKey];

  const handleRepor = () => {
    showAlert(
      'Repor Galão',
      `Repor ${ATOM_NOMES[atomKey]} a 100%?`,
      [
        { label: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { label: 'Repor', onPress: onRepor },
      ]
    );
  };

  return (
    <>
      <View style={[styles.card, isCritico && styles.cardCritico]}>
        <View style={styles.left}>
          <View style={[styles.symbolBadge, { backgroundColor: color + '22', borderColor: color }]}>
            <Text style={[styles.symbol, { color }]}>{atomKey}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.nome}>{ATOM_NOMES[atomKey]}</Text>
            <View style={styles.barRow}>
              <ProgressBar value={value} color={color} height={5} style={styles.bar} />
              <Text style={[styles.percent, { color }]}>{value.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleRepor}>
          <Text style={styles.btnText}>Repor</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={hideAlert}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  cardCritico: { borderColor: COLORS.critico + '80' },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  symbolBadge: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  symbol: { fontSize: 14, fontWeight: 'bold' },
  info: { flex: 1 },
  nome: { color: COLORS.text, fontSize: 13, marginBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bar: { flex: 1 },
  percent: { fontSize: 12, fontWeight: '600', width: 36, textAlign: 'right' },
  btn: {
    backgroundColor: COLORS.highlight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  btnText: { color: COLORS.ciano, fontSize: 12, fontWeight: '600' },
});
