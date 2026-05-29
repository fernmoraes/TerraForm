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

  if (!horta || !planeta) {
    return (
      <GradientBackground style={styles.center}>
        <Text style={styles.emptyText}>Nenhuma estufa selecionada</Text>
      </GradientBackground>
    );
  }

  // Nutrientes cujo galão tem estoque suficiente E o solo ainda não está em 100%
  const nutrientesProntos = SOLO_NUTRIENTES.filter(
    (n) => horta.estoqueAtomos[n] >= qtdTudo && horta.solo.nutrientes[n] < 100
  );

  const handleNutrirTudo = () => {
    nutrientesProntos.forEach((n) => aplicarAtomNoSolo(horta.id, n, qtdTudo));
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
              Aplica cada elemento do galão direto no solo de uma só vez
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
        onAplicar={(atomo, qtd) => aplicarAtomNoSolo(horta.id, atomo, qtd)}
        onClose={() => setSheetNutriente(null)}
      />

      {/* Modal nutrir tudo */}
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
              Aplica a quantidade escolhida de cada elemento diretamente no solo. Apenas os galões com estoque suficiente são aplicados.
            </Text>

            <Text style={styles.labelSec}>Quantidade por nutriente:</Text>
            <View style={styles.qtdRow}>
              {QUANTIDADES_TUDO.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.qtdBtn, qtdTudo === q && styles.qtdBtnActive]}
                  onPress={() => setQtdTudo(q)}
                >
                  <Text style={[styles.qtdText, qtdTudo === q && styles.qtdTextActive]}>{q}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.labelSec}>Galões disponíveis:</Text>
            {SOLO_NUTRIENTES.map((n) => {
              const galao = horta.estoqueAtomos[n];
              const solo = horta.solo.nutrientes[n];
              const soloMaximo = solo >= 100;
              const disponivel = galao >= qtdTudo && !soloMaximo;
              const color = NUTRIENT_COLORS[n];
              return (
                <View key={n} style={[styles.nutrienteRow, !disponivel && styles.nutrienteRowOff]}>
                  <View style={[styles.nBadge, { borderColor: disponivel ? color : COLORS.textDim }]}>
                    <Text style={[styles.nSimbolo, { color: disponivel ? color : COLORS.textDim }]}>{n}</Text>
                  </View>
                  <View style={styles.nInfo}>
                    <Text style={[styles.nNome, { color: disponivel ? color : COLORS.textDim }]}>
                      {NUTRIENTE_NOMES[n]}
                    </Text>
                    <View style={styles.nBars}>
                      <View style={styles.nBarItem}>
                        <Text style={styles.nBarLabel}>Solo</Text>
                        <ProgressBar value={solo} color={disponivel ? color : COLORS.textDim} height={4} style={styles.nBar} />
                        <Text style={[styles.nBarVal, { color: disponivel ? color : COLORS.textDim }]}>{solo.toFixed(0)}%</Text>
                      </View>
                      <View style={styles.nBarItem}>
                        <Text style={styles.nBarLabel}>Galão</Text>
                        <ProgressBar value={galao} color={disponivel ? color : COLORS.textDim} height={4} style={styles.nBar} />
                        <Text style={[styles.nBarVal, { color: disponivel ? color : COLORS.textDim }]}>{galao.toFixed(0)}%</Text>
                      </View>
                    </View>
                  </View>
                  {soloMaximo
                    ? <Text style={styles.maximo}>✓ máximo</Text>
                    : !disponivel && <Text style={styles.insuf}>sem estoque</Text>
                  }
                </View>
              );
            })}

            {nutrientesProntos.length === 0 && (
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
                style={[styles.confirmBtn, nutrientesProntos.length === 0 && styles.confirmBtnOff]}
                onPress={handleNutrirTudo}
                disabled={nutrientesProntos.length === 0}
              >
                <Text style={styles.confirmText}>
                  Aplicar ({nutrientesProntos.length}/{SOLO_NUTRIENTES.length} nutrientes)
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
  qtdRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  qtdBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  qtdBtnActive: { backgroundColor: COLORS.ciano + '28', borderColor: COLORS.ciano },
  qtdText: { color: COLORS.textSecondary, fontSize: 15 },
  qtdTextActive: { color: COLORS.ciano, fontWeight: 'bold' },

  nutrienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.highlight,
    gap: 10,
  },
  nutrienteRowOff: { opacity: 0.4 },
  nBadge: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  nSimbolo: { fontSize: 12, fontWeight: 'bold' },
  nInfo: { flex: 1 },
  nNome: { fontSize: 11, marginBottom: 4 },
  nBars: { gap: 3 },
  nBarItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nBarLabel: { color: COLORS.textDim, fontSize: 9, width: 28 },
  nBar: { flex: 1 },
  nBarVal: { fontSize: 10, width: 28, textAlign: 'right' },
  insuf: { color: COLORS.critico, fontSize: 9 },

  alertBox: {
    backgroundColor: COLORS.critico + '18',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.critico + '40',
  },
  alertText: { color: COLORS.critico, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
  confirmBtn: { flex: 2, backgroundColor: COLORS.ciano, borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmBtnOff: { backgroundColor: COLORS.highlight },
  confirmText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
