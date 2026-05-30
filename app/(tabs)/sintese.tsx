import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { ReacaoCard } from '../../components/sintese/ReacaoCard';
import { useHortaStore } from '../../store/hortaStore';
import { REACTIONS } from '../../data/reactions';
import { COLORS } from '../../constants/colors';

export default function SinteseScreen() {
  const horta = useHortaStore((s) => s.getHortaAtual());
  const sintetizarComposto = useHortaStore((s) => s.sintetizarComposto);

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
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Sintetize compostos a partir dos elementos brutos. Cada unidade produz 10% do composto.
          </Text>
        </View>
        {REACTIONS.map((reacao) => (
          <ReacaoCard
            key={reacao.composto}
            reacao={reacao}
            horta={horta}
            onSintetizar={(unidades) => sintetizarComposto(horta.id, reacao.composto, unidades)}
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
  infoBox: {
    backgroundColor: COLORS.highlight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
});
