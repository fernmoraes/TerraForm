import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useHortaStore } from '../store/hortaStore';
import { useAppStore } from '../store/appStore';
import { useSimulation } from '../hooks/useSimulation';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  const hortaHydrated = useHortaStore((s) => s._hasHydrated);
  const appHydrated = useAppStore((s) => s._hasHydrated);

  // Inicia a simulação de consumo de nutrientes
  useSimulation();

  // Força hidratação dos stores
  useEffect(() => {
    useHortaStore.persist.rehydrate();
    useAppStore.persist.rehydrate();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
