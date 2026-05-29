import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CustomAlert } from '../ui/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS, COMPOUND_COLORS } from '../../constants/colors';
import { REACTIONS } from '../../data/reactions';
import type { CompoundKey, AplicacaoAlvo } from '../../types';

const COMPOUND_NOMES: Record<CompoundKey, string> = {
  H2O: 'Água', NH3: 'Amônia', CaCO3: 'Carbonato de Cálcio', H2CO3: 'Ácido Carbônico',
};

interface Props {
  compoundKey: CompoundKey;
  value: number;
  onAplicar: (alvo: AplicacaoAlvo, quantidade: number) => void;
}

const QUANTIDADES = [10, 20, 30, 40, 50];

export function CompostoCard({ compoundKey, value, onAplicar }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const { alertVisible, alertTitle, alertMessage, alertButtons, showAlert, hideAlert } = useCustomAlert();
  const [selectedAlvo, setSelectedAlvo] = useState<AplicacaoAlvo>('solo');
  const [selectedQtd, setSelectedQtd] = useState(10);
  const color = COMPOUND_COLORS[compoundKey];
  const reacao = REACTIONS.find((r) => r.composto === compoundKey)!;

  const handleConfirmar = () => {
    if (value < selectedQtd) {
      showAlert('Estoque insuficiente', `Disponível: ${value.toFixed(0)}%`);
      return;
    }
    onAplicar(selectedAlvo, selectedQtd);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.nome, { color }]}>{COMPOUND_NOMES[compoundKey]}</Text>
            <Text style={styles.formula}>{compoundKey.replace(/(\d)/g, (m) => ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'][+m])}</Text>
          </View>
          <Text style={[styles.percent, { color }]}>{value.toFixed(0)}%</Text>
        </View>
        <ProgressBar value={value} color={color} height={6} style={styles.bar} />
        <Text style={styles.funcao} numberOfLines={2}>{reacao.funcao}</Text>
        <TouchableOpacity
          style={[styles.btn, { borderColor: color }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.btnText, { color }]}>Aplicar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, { color }]}>Aplicar {COMPOUND_NOMES[compoundKey]}</Text>

            {reacao.alvosDisponiveis.length > 1 && (
              <View style={styles.alvoRow}>
                {reacao.alvosDisponiveis.map((alvo) => (
                  <TouchableOpacity
                    key={alvo}
                    style={[styles.alvoBtn, selectedAlvo === alvo && { borderColor: color }]}
                    onPress={() => setSelectedAlvo(alvo)}
                  >
                    <Text style={[styles.alvoBtnText, selectedAlvo === alvo && { color }]}>
                      {alvo === 'solo' ? '🌱 Solo' : '💨 Ar'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sheetLabel}>Quantidade:</Text>
            <View style={styles.qtdRow}>
              {QUANTIDADES.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.qtdBtn, selectedQtd === q && { backgroundColor: color + '33', borderColor: color }]}
                  onPress={() => setSelectedQtd(q)}
                >
                  <Text style={[styles.qtdText, selectedQtd === q && { color }]}>{q}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: color }]} onPress={handleConfirmar}>
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  nome: { fontSize: 15, fontWeight: 'bold' },
  formula: { color: COLORS.textSecondary, fontSize: 12 },
  percent: { fontSize: 22, fontWeight: 'bold' },
  bar: { marginBottom: 8 },
  funcao: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 10, lineHeight: 17 },
  btn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  btnText: { fontWeight: '600', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  alvoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  alvoBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, alignItems: 'center' },
  alvoBtnText: { color: COLORS.textSecondary, fontSize: 14 },
  sheetLabel: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 10 },
  qtdRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  qtdBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  qtdText: { color: COLORS.textSecondary, fontSize: 14 },
  sheetActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 15 },
  confirmBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  confirmText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});
