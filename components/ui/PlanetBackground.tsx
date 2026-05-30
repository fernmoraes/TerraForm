import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { useHortaStore } from '../../store/hortaStore';
import { PLANET_IMAGES } from '../../data/seed';

const { width: W, height: H } = Dimensions.get('screen');
const SIZE           = W * 0.74;
const OPACITY_TARGET = 0.30;
const EXIT_RISE      = -80;

// Module-level flag: the rise animation only plays once (first tab mount).
// All other PlanetBackground instances skip it and appear at resting state immediately.
let mountAnimationPlayed = false;

interface Props { planetaId?: string; }

export function PlanetBackground({ planetaId: overrideId }: Props = {}) {
  const storeId = useHortaStore((s) => s.selectedPlanetaId);
  const planetaId = overrideId ?? storeId;

  const [currentId, setCurrentId] = useState(planetaId);
  const [prevId, setPrevId]       = useState<string | null>(null);

  const inTranslateY  = useRef(new Animated.Value(H)).current;
  const inOpacity     = useRef(new Animated.Value(0)).current;
  const outTranslateY = useRef(new Animated.Value(0)).current;
  const outOpacity    = useRef(new Animated.Value(0)).current;

  // Mount: first instance plays the rise animation; all others go straight to resting state.
  useEffect(() => {
    if (mountAnimationPlayed) {
      inTranslateY.setValue(0);
      inOpacity.setValue(OPACITY_TARGET);
      return;
    }
    mountAnimationPlayed = true;
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

  // Planet change: old drifts up + fades, new rises from bottom
  useEffect(() => {
    if (planetaId === currentId) return;

    setPrevId(currentId);
    setCurrentId(planetaId);

    outTranslateY.setValue(0);
    outOpacity.setValue(OPACITY_TARGET);
    Animated.parallel([
      Animated.timing(outTranslateY, { toValue: EXIT_RISE, duration: 600, useNativeDriver: true }),
      Animated.timing(outOpacity,    { toValue: 0,         duration: 600, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) setPrevId(null); });

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
      {prevImg && (
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, { opacity: outOpacity, transform: [{ translateY: outTranslateY }] }]}
        >
          <Image source={prevImg} style={styles.planet} resizeMode="contain" />
        </Animated.View>
      )}

      {currentImg && (
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, { opacity: inOpacity, transform: [{ translateY: inTranslateY }] }]}
        >
          <Image source={currentImg} style={styles.planet} resizeMode="contain" />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Full-screen overlay: React Native centers the planet for us — no manual top/left math
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  planet: {
    width: SIZE,
    height: SIZE,
  },
});
