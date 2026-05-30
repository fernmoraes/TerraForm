import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS } from '../../constants/colors';
import { formatTimestampRelativo } from '../../utils/formatters';
import type { LogEntry, TipoLog } from '../../types';

type Filtro = 'horta' | 'planeta' | 'global';

const TIPO_EMOJI: Record<TipoLog, string> = {
  aplicacao: '💧', sintese: '🧪', reposicao: '📥',
  alerta: '⚠️', crescimento: '🌱', leitura: '📊',
};
const TIPO_LABEL: Record<TipoLog, string> = {
  aplicacao: 'Aplicação', sintese: 'Síntese', reposicao: 'Reposição',
  alerta: 'Alerta', crescimento: 'Crescimento', leitura: 'Leitura',
};
const TIPO_COLOR: Record<TipoLog, string> = {
  aplicacao: COLORS.ciano, sintese: COLORS.roxo, reposicao: COLORS.dourado,
  alerta: COLORS.critico, crescimento: COLORS.verde, leitura: COLORS.textSecondary,
};

type Group = {
  hortaId: string;
  hortaNome: string;
  planetaId: string;
  planetaNome: string;
  planetaCor: string;
  entries: LogEntry[];
  criticals: number;
  warnings: number;
};

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'horta',   label: 'Esta Estufa' },
  { key: 'planeta', label: 'Planeta' },
  { key: 'global',  label: 'Global' },
];

export default function LogsScreen() {
  const [filtro, setFiltro]     = useState<Filtro>('global');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logs               = useHortaStore((s) => s.logs);
  const planetas           = useHortaStore((s) => s.planetas);
  const hortas             = useHortaStore((s) => s.hortas);
  const selectedPlanetaId  = useHortaStore((s) => s.selectedPlanetaId);
  const selectedHortaId    = useHortaStore((s) => s.selectedHortaId);
  const selectPlaneta      = useHortaStore((s) => s.selectPlaneta);
  const selectHorta        = useHortaStore((s) => s.selectHorta);

  const groups = useMemo((): Group[] => {
    const sorted = [...logs].reverse();

    let filtered = sorted;
    if (filtro === 'horta')   filtered = sorted.filter((l) => l.hortaId === selectedHortaId);
    if (filtro === 'planeta') filtered = sorted.filter((l) => l.planetaId === selectedPlanetaId);

    const map = new Map<string, LogEntry[]>();
    filtered.forEach((e) => {
      const arr = map.get(e.hortaId) ?? [];
      arr.push(e);
      map.set(e.hortaId, arr);
    });

    return Array.from(map.entries())
      .map(([hortaId, entries]) => {
        const horta   = hortas.find((h) => h.id === hortaId);
        const planeta = planetas.find((p) => p.id === entries[0]?.planetaId);
        if (!horta || !planeta) return null;
        return {
          hortaId,
          hortaNome:   horta.nome,
          planetaId:   planeta.id,
          planetaNome: planeta.nome,
          planetaCor:  planeta.cor,
          entries,
          criticals: entries.filter((e) => e.nivel === 'critico').length,
          warnings:  entries.filter((e) => e.nivel === 'atencao').length,
        };
      })
      .filter(Boolean) as Group[];
  }, [logs, filtro, selectedHortaId, selectedPlanetaId, hortas, planetas]);

  const handleNavigate = (hortaId: string, planetaId: string) => {
    selectPlaneta(planetaId);
    selectHorta(hortaId);
    router.push('/(tabs)/estufa');
  };

  return (
    <GradientBackground>
      {/* Filtros */}
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

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Nenhum evento registrado</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.hortaId}
          contentContainerStyle={styles.list}
          renderItem={({ item: g }) => {
            const isExpanded  = expandedId === g.hortaId;
            const hasCritico  = g.criticals > 0;
            const hasAtencao  = !hasCritico && g.warnings > 0;
            const accentColor = hasCritico ? COLORS.critico : hasAtencao ? COLORS.atencao : COLORS.border;

            const typeCounts = g.entries.reduce((acc, e) => {
              acc[e.tipo] = (acc[e.tipo] ?? 0) + 1;
              return acc;
            }, {} as Partial<Record<TipoLog, number>>);

            return (
              <View style={[styles.card, { borderColor: (hasCritico || hasAtencao) ? accentColor + '90' : COLORS.border }]}>

                {/* ── Header da estufa ─────────────────── */}
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <View style={[styles.planetDot, { backgroundColor: g.planetaCor }]} />
                    <View>
                      <Text style={styles.planetaNome}>{g.planetaNome}</Text>
                      <Text style={styles.hortaNome}>{g.hortaNome}</Text>
                    </View>
                  </View>
                  <View style={styles.headerRight}>
                    <Text style={styles.headerTime}>
                      {formatTimestampRelativo(g.entries[0].timestamp)}
                    </Text>
                    <Text style={styles.headerCount}>
                      {g.entries.length} evento{g.entries.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {/* ── Chips de resumo ───────────────────── */}
                <View style={styles.chipsRow}>
                  {(Object.entries(typeCounts) as [TipoLog, number][]).map(([tipo, count]) => (
                    <View
                      key={tipo}
                      style={[
                        styles.chip,
                        { backgroundColor: TIPO_COLOR[tipo] + '1A', borderColor: TIPO_COLOR[tipo] + '60' },
                      ]}
                    >
                      <Text style={styles.chipEmoji}>{TIPO_EMOJI[tipo]}</Text>
                      <Text style={[styles.chipText, { color: TIPO_COLOR[tipo] }]}>
                        {count}× {TIPO_LABEL[tipo]}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* ── Botão expandir/recolher ──────────── */}
                <TouchableOpacity
                  style={styles.expandBtn}
                  onPress={() => setExpandedId(isExpanded ? null : g.hortaId)}
                >
                  <Text style={styles.expandText}>
                    {isExpanded ? '▲  Recolher' : '▼  Ver eventos'}
                  </Text>
                </TouchableOpacity>

                {/* ── Seção expandida ───────────────────── */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    {g.entries.map((entry, idx) => {
                      const entryColor =
                        entry.nivel === 'critico' ? COLORS.critico
                        : entry.nivel === 'atencao' ? COLORS.atencao
                        : TIPO_COLOR[entry.tipo];
                      return (
                        <View
                          key={entry.id}
                          style={[
                            styles.entryRow,
                            idx === g.entries.length - 1 && styles.entryRowLast,
                          ]}
                        >
                          <Text style={styles.entryEmoji}>{TIPO_EMOJI[entry.tipo]}</Text>
                          <View style={styles.entryContent}>
                            <Text style={[styles.entryTipo, { color: entryColor }]}>
                              {TIPO_LABEL[entry.tipo]}
                              {entry.nivel === 'critico' && '  ⚠ CRÍTICO'}
                              {entry.nivel === 'atencao' && '  ! ATENÇÃO'}
                            </Text>
                            <Text style={styles.entryDesc}>{entry.descricao}</Text>
                          </View>
                          <Text style={styles.entryTime}>
                            {formatTimestampRelativo(entry.timestamp)}
                          </Text>
                        </View>
                      );
                    })}

                    {/* Botão Ir para Estufa */}
                    <TouchableOpacity
                      style={styles.navigateBtn}
                      onPress={() => handleNavigate(g.hortaId, g.planetaId)}
                    >
                      <Text style={styles.navigateText}>Ir para Estufa  →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row', padding: 12, gap: 8,
    backgroundColor: COLORS.cardGlass,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    alignItems: 'center', backgroundColor: COLORS.highlightGlass,
  },
  filterBtnActive: {
    backgroundColor: COLORS.ciano + '28',
    borderWidth: 1, borderColor: COLORS.ciano,
  },
  filterText: { color: COLORS.textSecondary, fontSize: 13 },
  filterTextActive: { color: COLORS.ciano, fontWeight: '600' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },

  list: { padding: 12, gap: 10, paddingBottom: 28 },

  // Card da estufa
  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planetDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  planetaNome: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 2 },
  hortaNome: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' },
  headerTime: { color: COLORS.textDim, fontSize: 11 },
  headerCount: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },

  // Chips de resumo
  chipsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, paddingHorizontal: 14, paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  chipEmoji: { fontSize: 11 },
  chipText: { fontSize: 11, fontWeight: '600' },

  // Expandir
  expandBtn: {
    borderTopWidth: 1, borderTopColor: COLORS.highlight,
    paddingVertical: 10, alignItems: 'center',
    backgroundColor: COLORS.highlight + '50',
  },
  expandText: { color: COLORS.ciano, fontSize: 13, fontWeight: '600' },

  // Seção expandida
  expandedSection: {
    borderTopWidth: 1, borderTopColor: COLORS.highlight,
    paddingHorizontal: 14, paddingTop: 4, paddingBottom: 14,
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.highlight + '70',
  },
  entryRowLast: { borderBottomWidth: 0 },
  entryEmoji: { fontSize: 16, marginTop: 1 },
  entryContent: { flex: 1 },
  entryTipo: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  entryDesc: { color: COLORS.text, fontSize: 13, lineHeight: 18 },
  entryTime: { color: COLORS.textDim, fontSize: 11, marginTop: 2, flexShrink: 0 },

  // Botão Ir para Estufa
  navigateBtn: {
    marginTop: 14,
    backgroundColor: COLORS.ciano,
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  navigateText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});
