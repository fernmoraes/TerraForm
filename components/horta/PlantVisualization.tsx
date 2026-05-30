import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS } from '../../constants/colors';
import { PLANT_SPECIES_DATA, FASE_LABELS } from '../../data/plants';
import { fasePorcentagem } from '../../utils/agriculture';
import type { Planta } from '../../types';

interface Props { planta: Planta }

export function PlantVisualization({ planta }: Props) {
  const specieData = PLANT_SPECIES_DATA[planta.especie];
  const progresso = fasePorcentagem(planta);
  const isColheita = planta.fase === 'colheita';

  return (
    <View style={styles.container}>
      <Image source={specieData.image} style={styles.cropImage} resizeMode="contain" />
      <Text style={[styles.especie, { color: specieData.cor }]}>{specieData.nome}</Text>
      <Text style={styles.nomecientifico}>{specieData.nomecientifico}</Text>
      <View style={styles.faseRow}>
        <Text style={styles.faseLabel}>{FASE_LABELS[planta.fase]}</Text>
        {!isColheita && (
          <Text style={styles.progText}>{progresso.toFixed(0)}%</Text>
        )}
      </View>
      {!isColheita && (
        <ProgressBar value={progresso} color={specieData.cor} height={8} style={styles.bar} />
      )}
      {isColheita && (
        <View style={styles.colheitaBadge}>
          <Text style={styles.colheitaText}>Pronta para colheita</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  cropImage: { width: 80, height: 80 },
  especie: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  nomecientifico: { color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic', marginBottom: 10 },
  faseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  faseLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  progText: { color: COLORS.textSecondary, fontSize: 13 },
  bar: { width: '100%' },
  colheitaBadge: {
    backgroundColor: COLORS.verde + '22',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.verde,
    marginTop: 4,
  },
  colheitaText: { color: COLORS.verde, fontSize: 13, fontWeight: '600' },
});
