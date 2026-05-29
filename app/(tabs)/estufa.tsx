import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
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
import { COLORS, ATOM_COLORS, COMPOUND_COLORS } from '../../constants/colors';
import { REACTIONS } from '../../data/reactions';
import type { AtomKey, SoloNutrienteKey, CompoundKey } from '../../types';

const SOLO_NUTRIENTES: SoloNutrienteKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
const ATOMS: AtomKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'O', 'H', 'C'];
const COMPOSTOS_SOLO: CompoundKey[] = ['H2O', 'NH3', 'CaCO3', 'H2CO3'];
const QUANTIDADES = [10, 20, 30];

export default function EstufaScreen() {
  const horta = useHortaStore((s) => s.getHortaAtual());
  const planeta = useHortaStore((s) => s.getPlanetaAtual());
  const aplicarComposto = useHortaStore((s) => s.aplicarComposto);

  const [sheetNutriente, setSheetNutriente] = useState<SoloNutrienteKey | null>(null);
  const [nutrirTudoVisible, setNutrirTudoVisible] = useState(false);
  const [qtdTudo, setQtdTudo] = useState(10);

  if (!horta || !planeta) {
    return (
      <GradientBackground style={styles.center}>
        <Text style={styles.emptyText}>Nenhuma estufa selecionada</Text>
      </GradientBackground>
    );
  }

  const handleAplicar = (composto: CompoundKey, quantidade: number) => {
    aplicarComposto(horta.id, composto, 'solo', quantidade);
  };

  const compostosProntos = COMPOSTOS_SOLO.filter(
    (k) => horta.estoqueCompostos[k] >= qtdTudo
  );

  const handleNutrirTudo = () => {
    compostosProntos.forEach((k) => aplicarComposto(horta.id, k, 'solo', qtdTudo));
    setNutrirTudoVisible(false);
  };

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

        {/* Botão Nutrir Tudo */}
        <TouchableOpacity
          style={styles.nutrirTudoBtn}
          onPress={() => setNutrirTudoVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.nutrirTudoIcon}>⚡</Text>
          <View>
            <Text style={styles.nutrirTudoLabel}>Nutrir Tudo</Text>
            <Text style={styles.nutrirTudoSub}>
              Aplica todos os compostos disponíveis no solo de uma vez
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reservatórios</Text>
        </View>
        <View style={styles.reservatoriosRow}>
          {ATOMS.map((a) => (
            <NivelIndicator key={a} symbol={a} value={horta.estoqueAtomos[a]} color={ATOM_COLORS[a]} />
          ))}
        </View>
      </ScrollView>

      {/* Sheet nutrir nutriente individual */}
      <NutrirSoloSheet
        visible={sheetNutriente !== null}
        nutriente={sheetNutriente}
        horta={horta}
        onAplicar={handleAplicar}
        onClose={() => setSheetNutriente(null)}
      />

      {/* Modal nutrir tudo */}
      <Modal visible={nutrirTudoVisible} transparent animationType="slide" onRequestClose={() => setNutrirTudoVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>⚡ Nutrir Tudo</Text>
            <Text style={styles.sheetSub}>
              Aplica todos os compostos com estoque suficiente no solo de uma vez.
            </Text>

            <Text style={styles.labelSec}>Quantidade por composto:</Text>
            <View style={styles.qtdRow}>
              {QUANTIDADES.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.qtdBtn, qtdTudo === q && styles.qtdBtnActive]}
                  onPress={() => setQtdTudo(q)}
                >
                  <Text style={[styles.qtdText, qtdTudo === q && styles.qtdTextActive]}>{q}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.labelSec}>Compostos que serão aplicados:</Text>
            {COMPOSTOS_SOLO.map((k) => {
              const estoque = horta.estoqueCompostos[k];
              const disponivel = estoque >= qtdTudo;
              const color = COMPOUND_COLORS[k];
              const nome = REACTIONS.find((r) => r.composto === k)?.nomeExibicao ?? k;
              return (
                <View key={k} style={[styles.compostoRow, !disponivel && styles.compostoRowOff]}>
                  <View style={styles.compostoRowLeft}>
                    <View style={[styles.dot, { backgroundColor: disponivel ? color : COLORS.textDim }]} />
                    <Text style={[styles.compostoNome, { color: disponivel ? color : COLORS.textDim }]}>
                      {nome}
                    </Text>
                  </View>
                  <View style={styles.compostoRowRight}>
                    <ProgressBar
                      value={estoque}
                      color={disponivel ? color : COLORS.textDim}
                      height={4}
                      style={styles.compostoBar}
                    />
                    <Text style={[styles.compostoEst, { color: disponivel ? color : COLORS.textDim }]}>
                      {estoque.toFixed(0)}%
                    </Text>
                    {!disponivel && (
                      <Text style={styles.insuficiente}>insuficiente</Text>
                    )}
                  </View>
                </View>
              );
            })}

            {compostosProntos.length === 0 && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  Nenhum composto tem estoque suficiente para {qtdTudo}%. Reduza a quantidade ou sintetize mais compostos.
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNutrirTudoVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, compostosProntos.length === 0 && styles.confirmBtnOff]}
                onPress={handleNutrirTudo}
                disabled={compostosProntos.length === 0}
              >
                <Text style={styles.confirmText}>
                  Aplicar ({compostosProntos.length} composto{compostosProntos.length !== 1 ? 's' : ''})
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
    backgroundColor: COLORS.highlight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.ciano + '60',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nutrirTudoIcon: { fontSize: 24 },
  nutrirTudoLabel: { color: COLORS.ciano, fontSize: 15, fontWeight: 'bold' },
  nutrirTudoSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },

  reservatoriosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Modal nutrir tudo
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetTitle: { color: COLORS.ciano, fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  sheetSub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 16, lineHeight: 18 },
  labelSec: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  qtdRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  qtdBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 8, paddingVertical: 9, alignItems: 'center',
  },
  qtdBtnActive: { backgroundColor: COLORS.ciano + '28', borderColor: COLORS.ciano },
  qtdText: { color: COLORS.textSecondary, fontSize: 15 },
  qtdTextActive: { color: COLORS.ciano, fontWeight: 'bold' },
  compostoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.highlight,
  },
  compostoRowOff: { opacity: 0.45 },
  compostoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 140 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  compostoNome: { fontSize: 13, fontWeight: '600' },
  compostoRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  compostoBar: { flex: 1 },
  compostoEst: { fontSize: 12, fontWeight: 'bold', width: 32, textAlign: 'right' },
  insuficiente: { color: COLORS.critico, fontSize: 9 },
  alertBox: {
    backgroundColor: COLORS.critico + '18',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.critico + '40',
  },
  alertText: { color: COLORS.critico, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 13, alignItems: 'center',
  },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
  confirmBtn: { flex: 2, backgroundColor: COLORS.ciano, borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmBtnOff: { backgroundColor: COLORS.highlight },
  confirmText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
