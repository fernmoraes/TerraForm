import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { useHortaStore } from '../../store/hortaStore';
import { PLANET_IMAGES } from '../../data/seed';

const { width: W, height: H } = Dimensions.get('window');

const SIZE = W * 0.74;
const RESTING_TOP = H * 0.38 - SIZE / 2;
const OPACITY_TARGET = 0.30;
const EXIT_RISE = -80; // subtle upward drift while fading out

export function PlanetBackground() {
  const planetaId = useHortaStore((s) => s.selectedPlanetaId);

  const [currentId, setCurrentId] = useState(planetaId);
  const [prevId, setPrevId]       = useState<string | null>(null);

  // Incoming planet
  const inTranslateY = useRef(new Animated.Value(H)).current;
  const inOpacity    = useRef(new Animated.Value(0)).current;

  // Outgoing planet — rises up and fades out
  const outTranslateY = useRef(new Animated.Value(0)).current;
  const outOpacity    = useRef(new Animated.Value(0)).current;

  // Initial planet rises from bottom on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(inTranslateY, {
        toValue: 0,
        tension: 30,
        friction: 13,
        useNativeDriver: true,
      }),
      Animated.timing(inOpacity, {
        toValue: OPACITY_TARGET,
        duration: 450,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (planetaId === currentId) return;

    setPrevId(currentId);
    setCurrentId(planetaId);

    // Old planet: rises up and fades out simultaneously
    outTranslateY.setValue(0);
    outOpacity.setValue(OPACITY_TARGET);
    Animated.parallel([
      Animated.timing(outTranslateY, {
        toValue: EXIT_RISE,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(outOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setPrevId(null);
    });

    // New planet: rises from bottom and fades in
    inTranslateY.setValue(H);
    inOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(inTranslateY, {
        toValue: 0,
        tension: 30,
        friction: 13,
        useNativeDriver: true,
      }),
      Animated.timing(inOpacity, {
        toValue: OPACITY_TARGET,
        duration: 450,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planetaId]);

  const currentImg = PLANET_IMAGES[currentId] ?? null;
  const prevImg    = prevId ? (PLANET_IMAGES[prevId] ?? null) : null;

  return (
    <>
      {/* Outgoing: rises up and fades out */}
      {prevImg && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrapper, { opacity: outOpacity, transform: [{ translateY: outTranslateY }] }]}
        >
          <Image source={prevImg} style={styles.planet} resizeMode="contain" />
        </Animated.View>
      )}

      {/* Incoming: rises from bottom and fades in */}
      {currentImg && (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrapper, { opacity: inOpacity, transform: [{ translateY: inTranslateY }] }]}
        >
          <Image source={currentImg} style={styles.planet} resizeMode="contain" />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: RESTING_TOP,
    left: (W - SIZE) / 2,
    width: SIZE,
    height: SIZE,
    zIndex: 0,
  },
  planet: { width: '100%', height: '100%' },
});
