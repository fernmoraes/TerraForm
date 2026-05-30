import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { GallonCard } from '../../components/estoque/GallonCard';
import { CompostoCard } from '../../components/estoque/CompostoCard';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS } from '../../constants/colors';
import type { AtomKey, CompoundKey } from '../../types';

const ATOM_KEYS: AtomKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'O', 'H', 'C'];
const COMPOUND_KEYS: CompoundKey[] = ['H2O', 'NH3', 'CaCO3', 'H2CO3'];

export default function EstoqueScreen() {
  const horta = useHortaStore((s) => s.getHortaAtual());
  const reporGalao = useHortaStore((s) => s.reporGalao);
  const aplicarComposto = useHortaStore((s) => s.aplicarComposto);

  if (!horta) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma estufa selecionada</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Elementos Brutos</Text>
        {ATOM_KEYS.map((key) => (
          <GallonCard
            key={key}
            atomKey={key}
            value={horta.estoqueAtomos[key]}
            onRepor={() => reporGalao(horta.id, key)}
          />
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleMargin]}>Compostos Sintetizados</Text>
        {COMPOUND_KEYS.map((key) => (
          <CompostoCard
            key={key}
            compoundKey={key}
            value={horta.estoqueCompostos[key]}
            onAplicar={(alvo, qtd) => aplicarComposto(horta.id, key, alvo, qtd)}
          />
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionTitleMargin: { marginTop: 20 },
});
