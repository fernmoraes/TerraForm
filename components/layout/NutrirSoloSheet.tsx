import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS, NUTRIENT_COLORS, COMPOUND_COLORS } from '../../constants/colors';
import { REACTIONS } from '../../data/reactions';
import type { SoloNutrienteKey, CompoundKey, Horta } from '../../types';

const NUTRIENTE_NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio',
  Ca: 'Cálcio', Mg: 'Magnésio', S: 'Enxofre',
};

// Qual composto é mais relevante para cada nutriente
const NUTRIENTE_RECOMENDADO: Partial<Record<SoloNutrienteKey, CompoundKey>> = {
  N: 'NH3',
  Ca: 'CaCO3',
};

// Descrição curta do efeito de cada composto no solo
const EFEITO_DESCRICAO: Record<CompoundKey, string> = {
  H2O:   '+umidade do solo',
  NH3:   '+15% N por 10% aplicado',
  CaCO3: '+12% Ca, +pH por 10% aplicado',
  H2CO3: '−pH (acidifica), +umidade leve',
};

const QUANTIDADES = [10, 20, 30, 40, 50];

// Apenas compostos que têm efeito no solo
const COMPOSTOS_SOLO: CompoundKey[] = ['H2O', 'NH3', 'CaCO3', 'H2CO3'];

interface Props {
  visible: boolean;
  nutriente: SoloNutrienteKey | null;
  horta: Horta;
  onAplicar: (composto: CompoundKey, quantidade: number) => void;
  onClose: () => void;
}

export function NutrirSoloSheet({ visible, nutriente, horta, onAplicar, onClose }: Props) {
  const [selectedComposto, setSelectedComposto] = useState<CompoundKey>('NH3');
  const [selectedQtd, setSelectedQtd] = useState(10);

  if (!nutriente) return null;

  const recomendado = NUTRIENTE_RECOMENDADO[nutriente];
  const nutriColor = NUTRIENT_COLORS[nutriente];
  const nutriValue = horta.solo.nutrientes[nutriente];

  const handleAplicar = () => {
    const estoque = horta.estoqueCompostos[selectedComposto];
    if (estoque < selectedQtd) {
      Alert.alert('Estoque insuficiente', `Disponível: ${estoque.toFixed(0)}% de ${selectedComposto}`);
      return;
    }
    onAplicar(selectedComposto, selectedQtd);
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
              <Text style={[styles.headerTitle, { color: nutriColor }]}>
                {nutriente} — {NUTRIENTE_NOMES[nutriente]}
              </Text>
            </View>
            <View style={styles.nutrienteValBox}>
              <Text style={[styles.nutrienteVal, { color: nutriColor }]}>
                {nutriValue.toFixed(0)}%
              </Text>
              <Text style={styles.nutrienteValLabel}>atual</Text>
            </View>
          </View>

          {/* Seletor de composto */}
          <Text style={styles.sectionLabel}>Escolha o composto:</Text>
          <ScrollView style={styles.compostoList} showsVerticalScrollIndicator={false}>
            {COMPOSTOS_SOLO.map((key) => {
              const color = COMPOUND_COLORS[key];
              const estoque = horta.estoqueCompostos[key];
              const isSelected = selectedComposto === key;
              const isRecomendado = key === recomendado;

              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.compostoItem, isSelected && { borderColor: color, backgroundColor: color + '15' }]}
                  onPress={() => setSelectedComposto(key)}
                >
                  <View style={styles.compostoTop}>
                    <View style={styles.compostoLeft}>
                      <Text style={[styles.compostoNome, { color }]}>
                        {REACTIONS.find(r => r.composto === key)?.nomeExibicao ?? key}
                      </Text>
                      {isRecomendado && (
                        <View style={[styles.recBadge, { borderColor: color }]}>
                          <Text style={[styles.recText, { color }]}>Recomendado</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.compostoEstoque, { color: estoque < 10 ? COLORS.critico : color }]}>
                      {estoque.toFixed(0)}%
                    </Text>
                  </View>
                  <ProgressBar value={estoque} color={estoque < 10 ? COLORS.critico : color} height={4} />
                  <Text style={styles.compostoEfeito}>{EFEITO_DESCRICAO[key]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Seletor de quantidade */}
          <Text style={styles.sectionLabel}>Quantidade a aplicar:</Text>
          <View style={styles.qtdRow}>
            {QUANTIDADES.map((q) => {
              const color = COMPOUND_COLORS[selectedComposto];
              const isSelected = selectedQtd === q;
              return (
                <TouchableOpacity
                  key={q}
                  style={[styles.qtdBtn, isSelected && { backgroundColor: color + '33', borderColor: color }]}
                  onPress={() => setSelectedQtd(q)}
                >
                  <Text style={[styles.qtdText, isSelected && { color }]}>{q}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ações */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.aplicarBtn, { backgroundColor: COMPOUND_COLORS[selectedComposto] }]}
              onPress={handleAplicar}
            >
              <Text style={styles.aplicarText}>
                Aplicar {selectedQtd}% de {selectedComposto}
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  nutrienteValBox: { alignItems: 'flex-end' },
  nutrienteVal: { fontSize: 28, fontWeight: 'bold' },
  nutrienteValLabel: { color: COLORS.textSecondary, fontSize: 11 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  compostoList: { maxHeight: 240, marginBottom: 14 },
  compostoItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  compostoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  compostoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compostoNome: { fontSize: 14, fontWeight: '600' },
  recBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  recText: { fontSize: 9, fontWeight: '600' },
  compostoEstoque: { fontSize: 14, fontWeight: 'bold' },
  compostoEfeito: { color: COLORS.textDim, fontSize: 11, marginTop: 4 },
  qtdRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  qtdBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  qtdText: { color: COLORS.textSecondary, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
  aplicarBtn: { flex: 2, borderRadius: 10, padding: 13, alignItems: 'center' },
  aplicarText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
