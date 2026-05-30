import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { PLANET_IMAGES } from '../../data/seed';

interface Props { gravidade: number; planetaNome: string; planetaId: string }

export function GravityIndicator({ gravidade, planetaNome, planetaId }: Props) {
  const img = PLANET_IMAGES[planetaId];
  return (
    <View style={styles.badge}>
      {img && <Image source={img} style={styles.planetImg} resizeMode="contain" />}
      <Text style={styles.text}>
        {planetaNome}  ·  {gravidade.toFixed(2)} g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.highlightGlass,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planetImg: { width: 28, height: 28, borderRadius: 14 },
  text: { color: COLORS.ciano, fontSize: 12, fontWeight: '600' },
});
