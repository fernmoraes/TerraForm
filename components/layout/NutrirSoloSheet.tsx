import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS, NUTRIENT_COLORS } from '../../constants/colors';
import { clamp } from '../../utils/formatters';
import type { SoloNutrienteKey, Horta } from '../../types';

const NUTRIENTE_NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio',
  Ca: 'Cálcio', Mg: 'Magnésio', S: 'Enxofre',
};

const QUANTIDADES = [10, 20, 30, 40, 50];

interface Props {
  visible: boolean;
  nutriente: SoloNutrienteKey | null;
  horta: Horta;
  onAplicar: (atomo: SoloNutrienteKey, quantidade: number) => void;
  onClose: () => void;
}

export function NutrirSoloSheet({ visible, nutriente, horta, onAplicar, onClose }: Props) {
  const [selectedQtd, setSelectedQtd] = useState(10);

  if (!nutriente) return null;

  const color = NUTRIENT_COLORS[nutriente];
  const soloAtual = horta.solo.nutrientes[nutriente];
  const galaoAtual = horta.estoqueAtomos[nutriente];
  const espaco = Math.max(0, 100 - soloAtual);
  const qtdReal = Math.min(selectedQtd, galaoAtual, espaco);
  const soloApos = clamp(soloAtual + qtdReal, 0, 100);
  const galaoApos = clamp(galaoAtual - qtdReal, 0, 100);
  const soloMaximo = espaco <= 0;
  const semEstoque = !soloMaximo && galaoAtual < 10;
  const bloqueado = soloMaximo || galaoAtual <= 0;

  const handleAplicar = () => {
    if (bloqueado) return;
    onAplicar(nutriente, selectedQtd);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Nutrir Solo</Text>
              <Text style={[styles.headerTitle, { color }]}>
                {nutriente} — {NUTRIENTE_NOMES[nutriente]}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Estado atual */}
          <View style={styles.statusRow}>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Solo atual</Text>
              <Text style={[styles.statusValue, { color }]}>{soloAtual.toFixed(0)}%</Text>
              <ProgressBar value={soloAtual} color={color} height={5} />
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Galão disponível</Text>
              <Text style={[styles.statusValue, { color: semEstoque ? COLORS.critico : color }]}>
                {galaoAtual.toFixed(0)}%
              </Text>
              <ProgressBar value={galaoAtual} color={semEstoque ? COLORS.critico : color} height={5} />
            </View>
          </View>

          {soloMaximo && (
            <View style={styles.maxBox}>
              <Text style={styles.maxText}>
                ✓ Solo já está em 100% — galão não será consumido.
              </Text>
            </View>
          )}

          {semEstoque && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>
                Galão de {nutriente} insuficiente. Reponha na aba Estoque.
              </Text>
            </View>
          )}

          {/* Seletor de quantidade */}
          <Text style={[styles.labelSec, soloMaximo && styles.dimText]}>Quantidade a aplicar:</Text>
          <View style={styles.qtdRow}>
            {QUANTIDADES.map((q) => {
              const indisponivel = q > galaoAtual;
              return (
                <TouchableOpacity
                  key={q}
                  style={[
                    styles.qtdBtn,
                    selectedQtd === q && !indisponivel && { backgroundColor: color + '33', borderColor: color },
                    indisponivel && styles.qtdBtnOff,
                  ]}
                  onPress={() => !indisponivel && setSelectedQtd(q)}
                  disabled={indisponivel}
                >
                  <Text style={[
                    styles.qtdText,
                    selectedQtd === q && !indisponivel && { color, fontWeight: 'bold' },
                    indisponivel && styles.qtdTextOff,
                  ]}>
                    {q}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Preview do resultado */}
          {!semEstoque && (
            <View style={styles.previewBox}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Solo {nutriente}</Text>
                <Text style={styles.previewChange}>
                  <Text style={{ color }}>{soloAtual.toFixed(0)}%</Text>
                  {'  →  '}
                  <Text style={{ color: COLORS.verde }}>{soloApos.toFixed(0)}%</Text>
                  {'  (+' + qtdReal.toFixed(0) + '%)'}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Galão {nutriente}</Text>
                <Text style={styles.previewChange}>
                  <Text style={{ color }}>{galaoAtual.toFixed(0)}%</Text>
                  {'  →  '}
                  <Text style={{ color: COLORS.atencao }}>{galaoApos.toFixed(0)}%</Text>
                  {'  (−' + qtdReal.toFixed(0) + '%)'}
                </Text>
              </View>
            </View>
          )}

          {/* Ações */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.aplicarBtn, { backgroundColor: bloqueado ? COLORS.highlight : color }]}
              onPress={handleAplicar}
              disabled={bloqueado}
            >
              <Text style={[styles.aplicarText, bloqueado && { color: COLORS.textDim }]}>
                {soloMaximo ? 'Solo já no máximo' : `Aplicar ${qtdReal.toFixed(0)}% de ${nutriente}`}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: COLORS.textSecondary, fontSize: 18, padding: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  statusBox: { flex: 1, gap: 4 },
  statusLabel: { color: COLORS.textSecondary, fontSize: 11 },
  statusValue: { fontSize: 22, fontWeight: 'bold' },
  arrow: { color: COLORS.textDim, fontSize: 20 },
  maxBox: {
    backgroundColor: COLORS.verde + '18',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.verde + '50',
  },
  maxText: { color: COLORS.verde, fontSize: 12 },
  alertBox: {
    backgroundColor: COLORS.critico + '18',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.critico + '40',
  },
  alertText: { color: COLORS.critico, fontSize: 12 },
  dimText: { opacity: 0.4 },
  labelSec: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  qtdRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  qtdBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  qtdBtnOff: { opacity: 0.3 },
  qtdText: { color: COLORS.textSecondary, fontSize: 14 },
  qtdTextOff: { color: COLORS.textDim },
  previewBox: {
    backgroundColor: COLORS.highlight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewLabel: { color: COLORS.textSecondary, fontSize: 13 },
  previewChange: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
  aplicarBtn: { flex: 2, borderRadius: 10, padding: 13, alignItems: 'center' },
  aplicarText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
