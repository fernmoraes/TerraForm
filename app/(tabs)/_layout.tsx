import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HeaderSelector } from '../../components/layout/HeaderSelector';
import { COLORS } from '../../constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

function HelpButton() {
  return (
    <TouchableOpacity style={styles.helpBtn} onPress={() => router.push('/(auth)')}>
      <Text style={styles.helpText}>?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  helpBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.ciano,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpText: { color: COLORS.ciano, fontSize: 14, fontWeight: 'bold' },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <HeaderSelector />,
        headerRight: () => <HelpButton />,
        headerStyle: { backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border } as object,
        headerTintColor: COLORS.text,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.ciano,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="estufa"
        options={{
          title: 'Estufa',
          tabBarIcon: ({ color }) => <TabIcon name="leaf-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="estoque"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color }) => <TabIcon name="cube-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sintese"
        options={{
          title: 'Síntese',
          tabBarIcon: ({ color }) => <TabIcon name="flask-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color }) => <TabIcon name="list-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
