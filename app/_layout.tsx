import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useHortaStore } from '../store/hortaStore';
import { useAppStore } from '../store/appStore';
import { useSimulation } from '../hooks/useSimulation';
import { COLORS } from '../constants/colors';

async function hideNavBar() {
  if (Platform.OS !== 'android') return;
  await NavigationBar.setVisibilityAsync('hidden');
}

export default function RootLayout() {
  const hortaHydrated = useHortaStore((s) => s._hasHydrated);
  const appHydrated = useAppStore((s) => s._hasHydrated);

  useSimulation();

  // Força hidratação dos stores
  useEffect(() => {
    useHortaStore.persist.rehydrate();
    useAppStore.persist.rehydrate();
  }, []);

  // Esconde a barra de navegação do Android; restaura ao voltar do background
  useEffect(() => {
    hideNavBar();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') hideNavBar();
    });
    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/index" />
        <Stack.Screen name="(auth)/tutorial" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
