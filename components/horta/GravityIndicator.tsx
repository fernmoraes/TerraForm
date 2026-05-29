import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface Props { gravidade: number; planetaNome: string }

export function GravityIndicator({ gravidade, planetaNome }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {planetaNome}  ·  Gravidade: {gravidade.toFixed(2)} g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.highlight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.ciano,
  },
  text: { color: COLORS.ciano, fontSize: 12, fontWeight: '600' },
});
