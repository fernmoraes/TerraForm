import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlanetBackground } from './PlanetBackground';

const BG_IMAGE = require('../../assets/background.png');

interface Props {
  children: React.ReactNode;
}

export function GradientBackground({ children }: Props) {
  return (
    <ImageBackground source={BG_IMAGE} style={styles.fill} resizeMode="cover">
      <LinearGradient
        colors={['rgba(5,10,26,0.82)', 'rgba(7,15,36,0.76)', 'rgba(5,10,26,0.88)']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.fill}
      >
        <PlanetBackground />
        {children}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
