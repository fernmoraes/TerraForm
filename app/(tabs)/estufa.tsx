import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { NivelIndicator } from '../../components/ui/NivelIndicator';
import { GravityIndicator } from '../../components/horta/GravityIndicator';
import { PlantVisualization } from '../../components/horta/PlantVisualization';
import { SoloQualidadeCard } from '../../components/horta/SoloQualidadeCard';
import { ArQualidadeCard } from '../../components/horta/ArQualidadeCard';
import { NutrienteCard } from '../../components/horta/NutrienteCard';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS, ATOM_COLORS } from '../../constants/colors';
import type { AtomKey, SoloNutrienteKey } from '../../types';

const SOLO_NUTRIENTES: SoloNutrienteKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
const ATOMS: AtomKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'O', 'H', 'C'];

export default function EstufaScreen() {
  const horta = useHortaStore((s) => s.getHortaAtual());
  const planeta = useHortaStore((s) => s.getPlanetaAtual());

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
        </View>
        <View style={styles.nutrientesGrid}>
          {SOLO_NUTRIENTES.map((n) => (
            <NutrienteCard key={n} nutriente={n} value={horta.solo.nutrientes[n]} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reservatórios</Text>
        </View>
        <View style={styles.reservatoriosRow}>
          {ATOMS.map((a) => (
            <NivelIndicator key={a} symbol={a} value={horta.estoqueAtomos[a]} color={ATOM_COLORS[a]} />
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  sectionHeader: { marginTop: 4 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  nutrientesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  reservatoriosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
