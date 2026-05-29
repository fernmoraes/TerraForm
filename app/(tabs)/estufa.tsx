import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { NivelIndicator } from '../../components/ui/NivelIndicator';
import { GravityIndicator } from '../../components/horta/GravityIndicator';
import { PlantVisualization } from '../../components/horta/PlantVisualization';
import { SoloQualidadeCard } from '../../components/horta/SoloQualidadeCard';
import { ArQualidadeCard } from '../../components/horta/ArQualidadeCard';
import { NutrienteCard } from '../../components/horta/NutrienteCard';
import { NutrirSoloSheet } from '../../components/layout/NutrirSoloSheet';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS, ATOM_COLORS, NUTRIENT_COLORS } from '../../constants/colors';
import type { AtomKey, SoloNutrienteKey } from '../../types';

const SOLO_NUTRIENTES: SoloNutrienteKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
const ATOMS: AtomKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'O', 'H', 'C'];
const QUANTIDADES_TUDO = [10, 20, 30];

const NUTRIENTE_NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio',
  Ca: 'Cálcio', Mg: 'Magnésio', S: 'Enxofre',
};

export default function EstufaScreen() {
  const horta = useHortaStore((s) => s.getHortaAtual());
  const planeta = useHortaStore((s) => s.getPlanetaAtual());
  const aplicarAtomNoSolo = useHortaStore((s) => s.aplicarAtomNoSolo);

  const [sheetNutriente, setSheetNutriente] = useState<SoloNutrienteKey | null>(null);
  const [nutrirTudoVisible, setNutrirTudoVisible] = useState(false);
  const [qtdTudo, setQtdTudo] = useState(10);
  const [selecionados, setSelecionados] = useState<Set<SoloNutrienteKey>>(new Set());

  // Nutrientes elegíveis: solo < 100% E galão >= qtdTudo
  const elegiveis = horta
    ? SOLO_NUTRIENTES.filter(
        (n) => horta.solo.nutrientes[n] < 100 && horta.estoqueAtomos[n] >= qtdTudo
      )
    : [];

  // Ao abrir o modal, pré-seleciona todos os elegíveis
  useEffect(() => {
    if (nutrirTudoVisible) setSelecionados(new Set(elegiveis));
  }, [nutrirTudoVisible]);

  // Ao mudar a quantidade, remove da seleção os que ficaram sem estoque
  const handleQtdChange = (q: number) => {
    setQtdTudo(q);
    if (!horta) return;
    setSelecionados((prev) => {
      const next = new Set(prev);
      SOLO_NUTRIENTES.forEach((n) => {
        if (horta.estoqueAtomos[n] < q || horta.solo.nutrientes[n] >= 100) next.delete(n);
      });
      return next;
    });
  };

  const toggleNutriente = (n: SoloNutrienteKey) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  const allSelected = elegiveis.length > 0 && elegiveis.every((n) => selecionados.has(n));
  const toggleAll = () => setSelecionados(allSelected ? new Set() : new Set(elegiveis));

  const handleNutrirTudo = () => {
    if (!horta) return;
    selecionados.forEach((n) => aplicarAtomNoSolo(horta.id, n, qtdTudo));
    setNutrirTudoVisible(false);
  };

  if (!horta || !planeta) {
    return (
      <GradientBackground style={styles.center}>
        <Text style={styles.emptyText}>Nenhuma estufa selecionada</Text>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GravityIndicator gravidade={planeta.gravidade} planetaNome={planeta.nome} />
        <PlantVisualization planta={horta.planta} />
        <SoloQualidadeCard solo={horta.solo} />
        <ArQualidadeCard ar={horta.ar} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutrientes do Solo</Text>
          <Text style={styles.sectionHint}>Toque para nutrir</Text>
        </View>
        <View style={styles.nutrientesGrid}>
          {SOLO_NUTRIENTES.map((n) => (
            <NutrienteCard
              key={n}
              nutriente={n}
              value={horta.solo.nutrientes[n]}
              onPress={() => setSheetNutriente(n)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nutrirTudoBtn}
          onPress={() => setNutrirTudoVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.nutrirTudoIcon}>⚡</Text>
          <View>
            <Text style={styles.nutrirTudoLabel}>Nutrir Tudo</Text>
            <Text style={styles.nutrirTudoSub}>Selecione quais nutrientes quer aplicar de uma vez</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reservatórios</Text>
          <Text style={styles.sectionHint}>Toque para gerenciar</Text>
        </View>
        <TouchableOpacity
          style={styles.reservatoriosRow}
          onPress={() => router.push('/(tabs)/estoque')}
          activeOpacity={0.75}
        >
          {ATOMS.map((a) => (
            <NivelIndicator key={a} symbol={a} value={horta.estoqueAtomos[a]} color={ATOM_COLORS[a]} />
          ))}
          <Text style={styles.reservatoriosArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      <NutrirSoloSheet
        visible={sheetNutriente !== null}
        nutriente={sheetNutriente}
        horta={horta}
        onAplicar={(atomo, qtd) => aplicarAtomNoSolo(horta.id, atomo, qtd)}
        onClose={() => setSheetNutriente(null)}
      />

      {/* Modal Nutrir Tudo */}
      <Modal
        visible={nutrirTudoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNutrirTudoVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>⚡ Nutrir Tudo</Text>
            <Text style={styles.sheetSub}>
              Selecione os nutrientes e a quantidade. Apenas os galões com estoque suficiente podem ser selecionados.
            </Text>

            {/* Quantidade */}
            <Text style={styles.labelSec}>Quantidade por nutriente:</Text>
            <View style={styles.qtdRow}>
              {QUANTIDADES_TUDO.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.qtdBtn, qtdTudo === q && styles.qtdBtnActive]}
                  onPress={() => handleQtdChange(q)}
                >
                  <Text style={[styles.qtdText, qtdTudo === q && styles.qtdTextActive]}>{q}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selecionar todos / Limpar */}
            <View style={styles.selectAllRow}>
              <Text style={styles.labelSec}>Nutrientes:</Text>
              {elegiveis.length > 0 && (
                <TouchableOpacity onPress={toggleAll}>
                  <Text style={styles.toggleAllText}>
                    {allSelected ? 'Limpar seleção' : 'Selecionar todos'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de nutrientes */}
            {SOLO_NUTRIENTES.map((n) => {
              const galao = horta.estoqueAtomos[n];
              const solo = horta.solo.nutrientes[n];
              const soloMax = solo >= 100;
              const semEstoque = !soloMax && galao < qtdTudo;
              const elegivel = !soloMax && !semEstoque;
              const selecionado = selecionados.has(n);
              const color = NUTRIENT_COLORS[n];

              return (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.nutrienteRow,
                    elegivel && selecionado && { borderColor: color, backgroundColor: color + '10' },
                    !elegivel && styles.nutrienteRowOff,
                  ]}
                  onPress={() => elegivel && toggleNutriente(n)}
                  activeOpacity={elegivel ? 0.7 : 1}
                >
                  {/* Checkbox */}
                  <View style={[
                    styles.checkbox,
                    elegivel && selecionado && { backgroundColor: color, borderColor: color },
                    elegivel && !selecionado && { borderColor: color + '80' },
                    !elegivel && { borderColor: COLORS.textDim },
                  ]}>
                    {selecionado && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  {/* Badge símbolo */}
                  <View style={[styles.nBadge, { borderColor: elegivel ? color : COLORS.textDim }]}>
                    <Text style={[styles.nSimbolo, { color: elegivel ? color : COLORS.textDim }]}>{n}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.nInfo}>
                    <Text style={[styles.nNome, { color: elegivel ? color : COLORS.textDim }]}>
                      {NUTRIENTE_NOMES[n]}
                    </Text>
                    <View style={styles.nBars}>
                      <View style={styles.nBarItem}>
                        <Text style={styles.nBarLabel}>Solo</Text>
                        <ProgressBar value={solo} color={elegivel ? color : COLORS.textDim} height={4} style={styles.nBar} />
                        <Text style={[styles.nBarVal, { color: elegivel ? color : COLORS.textDim }]}>{solo.toFixed(0)}%</Text>
                      </View>
                      <View style={styles.nBarItem}>
                        <Text style={styles.nBarLabel}>Galão</Text>
                        <ProgressBar value={galao} color={elegivel ? color : COLORS.textDim} height={4} style={styles.nBar} />
                        <Text style={[styles.nBarVal, { color: elegivel ? color : COLORS.textDim }]}>{galao.toFixed(0)}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Status badge */}
                  {soloMax && <Text style={styles.soloMax}>✓ máximo</Text>}
                  {semEstoque && <Text style={styles.insuf}>sem estoque</Text>}
                </TouchableOpacity>
              );
            })}

            {elegiveis.length === 0 && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  Nenhum galão tem {qtdTudo}% disponível. Reduza a quantidade ou reponha os galões na aba Estoque.
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNutrirTudoVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, selecionados.size === 0 && styles.confirmBtnOff]}
                onPress={handleNutrirTudo}
                disabled={selecionados.size === 0}
              >
                <Text style={styles.confirmText}>
                  Aplicar ({selecionados.size} nutriente{selecionados.size !== 1 ? 's' : ''})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  sectionHeader: { marginTop: 4, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  sectionHint: { color: COLORS.textDim, fontSize: 11 },
  nutrientesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  nutrirTudoBtn: {
    backgroundColor: COLORS.highlight, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.ciano + '60', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  nutrirTudoIcon: { fontSize: 24 },
  nutrirTudoLabel: { color: COLORS.ciano, fontSize: 15, fontWeight: 'bold' },
  nutrirTudoSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  reservatoriosRow: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  reservatoriosArrow: { color: COLORS.textDim, fontSize: 22, marginLeft: 4 },

  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  sheetTitle: { color: COLORS.ciano, fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  sheetSub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 16, lineHeight: 18 },
  labelSec: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  qtdRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  qtdBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  qtdBtnActive: { backgroundColor: COLORS.ciano + '28', borderColor: COLORS.ciano },
  qtdText: { color: COLORS.textSecondary, fontSize: 15 },
  qtdTextActive: { color: COLORS.ciano, fontWeight: 'bold' },

  selectAllRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  toggleAllText: { color: COLORS.ciano, fontSize: 12, fontWeight: '600' },

  nutrienteRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 8,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 6, gap: 8,
  },
  nutrienteRowOff: { opacity: 0.38 },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', borderColor: COLORS.border,
  },
  checkmark: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  nBadge: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  nSimbolo: { fontSize: 11, fontWeight: 'bold' },
  nInfo: { flex: 1 },
  nNome: { fontSize: 11, marginBottom: 3 },
  nBars: { gap: 2 },
  nBarItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  nBarLabel: { color: COLORS.textDim, fontSize: 9, width: 28 },
  nBar: { flex: 1 },
  nBarVal: { fontSize: 10, width: 28, textAlign: 'right' },
  soloMax: { color: COLORS.verde, fontSize: 9, fontWeight: '600' },
  insuf: { color: COLORS.critico, fontSize: 9 },

  alertBox: { backgroundColor: COLORS.critico + '18', borderRadius: 8, padding: 10, marginTop: 4, borderWidth: 1, borderColor: COLORS.critico + '40' },
  alertText: { color: COLORS.critico, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
  confirmBtn: { flex: 2, backgroundColor: COLORS.ciano, borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmBtnOff: { backgroundColor: COLORS.highlight },
  confirmText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
