import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/appStore';
import { useHortaStore } from '../store/hortaStore';
import { COLORS } from '../constants/colors';

export default function Index() {
  const appHydrated = useAppStore((s) => s._hasHydrated);
  const hortaHydrated = useHortaStore((s) => s._hasHydrated);
  const tutorialCompleted = useAppStore((s) => s.tutorialCompleted);

  if (!appHydrated || !hortaHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.ciano} size="large" />
      </View>
    );
  }

  if (!tutorialCompleted) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href="/(tabs)/estufa" />;
}
