import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  style?: object;
}

export function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[COLORS.background, '#070F24', '#050A1A']}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
