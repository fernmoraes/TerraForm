import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { LogEntryItem } from '../../components/logs/LogEntryItem';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS } from '../../constants/colors';
import type { LogEntry } from '../../types';

type Filtro = 'horta' | 'planeta' | 'global';

export default function LogsScreen() {
  const [filtro, setFiltro] = useState<Filtro>('horta');
  const logs = useHortaStore((s) => s.logs);
  const planetas = useHortaStore((s) => s.planetas);
  const hortas = useHortaStore((s) => s.hortas);
  const selectedPlanetaId = useHortaStore((s) => s.selectedPlanetaId);
  const selectedHortaId = useHortaStore((s) => s.selectedHortaId);

  const filteredLogs = useMemo((): LogEntry[] => {
    const sorted = [...logs].reverse();
    if (filtro === 'horta') return sorted.filter((l) => l.hortaId === selectedHortaId);
    if (filtro === 'planeta') return sorted.filter((l) => l.planetaId === selectedPlanetaId);
    return sorted;
  }, [logs, filtro, selectedHortaId, selectedPlanetaId]);

  const getNames = (entry: LogEntry) => ({
    planetaNome: planetas.find((p) => p.id === entry.planetaId)?.nome,
    hortaNome: hortas.find((h) => h.id === entry.hortaId)?.nome,
  });

  const FILTROS: { key: Filtro; label: string }[] = [
    { key: 'horta', label: 'Estufa' },
    { key: 'planeta', label: 'Planeta' },
    { key: 'global', label: 'Global' },
  ];

  return (
    <GradientBackground>
      <View style={styles.filterRow}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filtro === f.key && styles.filterBtnActive]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.filterText, filtro === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredLogs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum evento registrado</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const { planetaNome, hortaNome } = getNames(item);
            return (
              <LogEntryItem
                entry={item}
                showPlanetaHorta={filtro !== 'horta'}
                planetaNome={planetaNome}
                hortaNome={hortaNome}
              />
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.highlight,
  },
  filterBtnActive: { backgroundColor: COLORS.ciano + '33', borderWidth: 1, borderColor: COLORS.ciano },
  filterText: { color: COLORS.textSecondary, fontSize: 13 },
  filterTextActive: { color: COLORS.ciano, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
  list: { paddingBottom: 20 },
});
