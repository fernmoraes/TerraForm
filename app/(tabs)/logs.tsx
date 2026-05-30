import { useState, useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS } from '../../constants/colors';
import { PLANET_IMAGES, SEED_HORTAS } from '../../data/seed';
import { THRESHOLDS } from '../../constants/thresholds';
import { formatTimestampRelativo } from '../../utils/formatters';
import type { Horta, LogEntry, TipoLog, NivelAlerta, SoloNutrienteKey } from '../../types';

const HORTA_ORDER = new Map(SEED_HORTAS.map((h, i) => [h.id, i]));

const NUTRIENTE_NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio', Ca: 'Cálcio', Mg: 'Magnésio', S: 'Enxofre',
};

type Alerta = { texto: string; nivel: NivelAlerta };

function buildAlertas(horta: Horta): Alerta[] {
  const list: Alerta[] = [];

  (Object.keys(horta.solo.nutrientes) as SoloNutrienteKey[]).forEach((k) => {
    const v = horta.solo.nutrientes[k];
    if (v < THRESHOLDS.nutrienteCritico)
      list.push({ nivel: 'critico', texto: `${NUTRIENTE_NOMES[k]} crítico — ${v.toFixed(0)}%` });
    else if (v < THRESHOLDS.nutrienteAtencao)
      list.push({ nivel: 'atencao', texto: `${NUTRIENTE_NOMES[k]} baixo — ${v.toFixed(0)}%` });
  });

  const um = horta.solo.umidade;
  if (um < THRESHOLDS.umidadeSoloMin)
    list.push({ nivel: 'critico', texto: `Umidade do solo crítica — ${um.toFixed(0)}%` });
  else if (um < THRESHOLDS.umidadeSoloAtencao)
    list.push({ nivel: 'atencao', texto: `Umidade do solo baixa — ${um.toFixed(0)}%` });

  const ph = horta.solo.ph;
  if (ph < THRESHOLDS.phMinCritico || ph > THRESHOLDS.phMaxCritico)
    list.push({ nivel: 'critico', texto: `pH crítico — ${ph.toFixed(1)}` });
  else if (ph < THRESHOLDS.phMinAtencao || ph > THRESHOLDS.phMaxAtencao)
    list.push({ nivel: 'atencao', texto: `pH fora do ideal — ${ph.toFixed(1)}` });

  const o2 = horta.ar.o2;
  if (o2 < THRESHOLDS.o2MinCritico)
    list.push({ nivel: 'critico', texto: `O₂ crítico — ${o2.toFixed(1)}%` });
  else if (o2 < THRESHOLDS.o2MinAtencao)
    list.push({ nivel: 'atencao', texto: `O₂ baixo — ${o2.toFixed(1)}%` });

  const co2 = horta.ar.co2;
  if (co2 > THRESHOLDS.co2MaxCritico)
    list.push({ nivel: 'critico', texto: `CO₂ perigoso — ${co2.toFixed(2)}%` });
  else if (co2 > THRESHOLDS.co2MaxAtencao)
    list.push({ nivel: 'atencao', texto: `CO₂ elevado — ${co2.toFixed(2)}%` });

  return list.sort((a, b) => (a.nivel === 'critico' ? -1 : b.nivel === 'critico' ? 1 : 0));
}

type Filtro = 'horta' | 'planeta' | 'global';

const TIPO_EMOJI: Record<TipoLog, string> = {
  aplicacao: '💧', sintese: '🧪', reposicao: '📥',
  alerta: '⚠️', crescimento: '🌱', leitura: '📊',
};
const TIPO_COLOR: Record<TipoLog, string> = {
  aplicacao: COLORS.ciano, sintese: COLORS.roxo, reposicao: COLORS.dourado,
  alerta: COLORS.critico, crescimento: COLORS.verde, leitura: COLORS.textSecondary,
};

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'horta',   label: 'Esta Estufa' },
  { key: 'planeta', label: 'Planeta' },
  { key: 'global',  label: 'Global' },
];

const MAX_VISIBLE = 8;

type Group = {
  hortaId: string;
  hortaNome: string;
  planetaId: string;
  planetaNome: string;
  planetaCor: string;
  horta: Horta;
  entries: LogEntry[];
  criticals: number;
  warnings: number;
  alertas: Alerta[];
};

export default function LogsScreen() {
  const [filtro, setFiltro]         = useState<Filtro>('global');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logs              = useHortaStore((s) => s.logs);
  const planetas          = useHortaStore((s) => s.planetas);
  const hortas            = useHortaStore((s) => s.hortas);
  const selectedPlanetaId = useHortaStore((s) => s.selectedPlanetaId);
  const selectedHortaId   = useHortaStore((s) => s.selectedHortaId);
  const selectPlaneta     = useHortaStore((s) => s.selectPlaneta);
  const selectHorta       = useHortaStore((s) => s.selectHorta);
  const clearLogsHorta    = useHortaStore((s) => s.clearLogsHorta);
  const { alertVisible, alertTitle, alertMessage, alertButtons, showAlert, hideAlert } = useCustomAlert();

  const groups = useMemo((): Group[] => {
    const sorted = [...logs].reverse();

    let filteredLogs = sorted;
    if (filtro === 'horta')   filteredLogs = sorted.filter((l) => l.hortaId === selectedHortaId);
    if (filtro === 'planeta') filteredLogs = sorted.filter((l) => l.planetaId === selectedPlanetaId);

    // Index logs by horta
    const entryMap = new Map<string, LogEntry[]>();
    filteredLogs.forEach((e) => {
      const arr = entryMap.get(e.hortaId) ?? [];
      arr.push(e);
      entryMap.set(e.hortaId, arr);
    });

    // Build from ALL relevant hortas so cleared ones still appear
    let relevantHortas = hortas;
    if (filtro === 'horta')   relevantHortas = hortas.filter((h) => h.id === selectedHortaId);
    if (filtro === 'planeta') relevantHortas = hortas.filter((h) => h.planetaId === selectedPlanetaId);

    return relevantHortas
      .map((horta) => {
        const planeta = planetas.find((p) => p.id === horta.planetaId);
        if (!planeta) return null;
        const entries = entryMap.get(horta.id) ?? [];
        return {
          hortaId:     horta.id,
          hortaNome:   horta.nome,
          planetaId:   planeta.id,
          planetaNome: planeta.nome,
          planetaCor:  planeta.cor,
          horta,
          entries,
          criticals: entries.filter((e) => e.nivel === 'critico').length,
          warnings:  entries.filter((e) => e.nivel === 'atencao').length,
          alertas:   buildAlertas(horta),
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        (HORTA_ORDER.get((a as Group).hortaId) ?? 99) - (HORTA_ORDER.get((b as Group).hortaId) ?? 99)
      ) as Group[];
  }, [logs, filtro, selectedHortaId, selectedPlanetaId, hortas, planetas]);

  const handleNavigate = (hortaId: string, planetaId: string) => {
    selectPlaneta(planetaId);
    selectHorta(hortaId);
    router.push('/(tabs)/estufa');
  };

  const handleClear = (hortaId: string, hortaNome: string) => {
    showAlert(
      'Limpar logs',
      `Remover todos os registros de "${hortaNome}"?`,
      [
        { label: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { label: 'Limpar', onPress: () => clearLogsHorta(hortaId), style: 'destructive' },
      ]
    );
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
          <Text style={styles.emptyText}>Nenhuma estufa encontrada</Text>
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
            const accentColor = hasCritico ? COLORS.critico : hasAtencao ? COLORS.atencao : COLORS.borderGlass;

            const typeCounts = g.entries.reduce((acc, e) => {
              acc[e.tipo] = (acc[e.tipo] ?? 0) + 1;
              return acc;
            }, {} as Partial<Record<TipoLog, number>>);

            const visibleEntries = g.entries.slice(0, MAX_VISIBLE);
            const hiddenCount    = g.entries.length - MAX_VISIBLE;

            return (
              <View style={[styles.card, { borderColor: accentColor }]}>

                {/* ── Header ── */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => g.entries.length > 0 && setExpandedId(isExpanded ? null : g.hortaId)}
                  activeOpacity={g.entries.length > 0 ? 0.75 : 1}
                >
                  <View style={styles.headerLeft}>
                    {PLANET_IMAGES[g.planetaId]
                      ? <Image source={PLANET_IMAGES[g.planetaId]} style={styles.planetImg} resizeMode="contain" />
                      : <View style={[styles.planetDot, { backgroundColor: g.planetaCor }]} />
                    }
                    <View>
                      <Text style={styles.planetaNome}>{g.planetaNome}</Text>
                      <Text style={styles.hortaNome}>{g.hortaNome}</Text>
                    </View>
                  </View>

                  <View style={styles.headerRight}>
                    {(hasCritico || hasAtencao) && (
                      <View style={[styles.alertBadge, { backgroundColor: accentColor + '22', borderColor: accentColor }]}>
                        <Text style={[styles.alertBadgeText, { color: accentColor }]}>
                          {hasCritico ? `⚠ ${g.criticals}` : `▲ ${g.warnings}`}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.headerCount}>
                      {g.entries.length > 0 ? `${g.entries.length} eventos` : 'sem registros'}
                    </Text>
                    {g.entries.length > 0 && (
                      <Text style={styles.headerTime}>{formatTimestampRelativo(g.entries[0].timestamp)}</Text>
                    )}
                    {g.entries.length > 0 && (
                      <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* ── Alertas ativos ── */}
                {g.alertas.length > 0 && (
                  <View style={styles.alertsSection}>
                    {g.alertas.slice(0, 4).map((a, i) => {
                      const color = a.nivel === 'critico' ? COLORS.critico : COLORS.atencao;
                      return (
                        <View key={i} style={styles.alertRow}>
                          <View style={[styles.alertDot, { backgroundColor: color }]} />
                          <Text style={[styles.alertText, { color }]} numberOfLines={1}>
                            {a.texto}
                          </Text>
                        </View>
                      );
                    })}
                    {g.alertas.length > 4 && (
                      <Text style={styles.moreAlerts}>+{g.alertas.length - 4} alertas</Text>
                    )}
                  </View>
                )}

                {/* ── Chips compactos ── */}
                {g.entries.length === 0 && (
                  <Text style={styles.emptyCard}>Nenhum registro</Text>
                )}
                {g.entries.length > 0 && <View style={styles.chipsRow}>
                  {(Object.entries(typeCounts) as [TipoLog, number][]).map(([tipo, count]) => (
                    <View key={tipo} style={[styles.chip, { borderColor: TIPO_COLOR[tipo] + '55' }]}>
                      <Text style={styles.chipEmoji}>{TIPO_EMOJI[tipo]}</Text>
                      <Text style={[styles.chipCount, { color: TIPO_COLOR[tipo] }]}>{count}</Text>
                    </View>
                  ))}
                </View>}

                {/* ── Entradas expandidas ── */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    {visibleEntries.map((entry, idx) => {
                      const isAlert = entry.nivel === 'critico' || entry.nivel === 'atencao';
                      const entryColor =
                        entry.nivel === 'critico' ? COLORS.critico
                        : entry.nivel === 'atencao' ? COLORS.atencao
                        : TIPO_COLOR[entry.tipo];
                      const isLast = idx === visibleEntries.length - 1 && hiddenCount <= 0;

                      return (
                        <View
                          key={entry.id}
                          style={[styles.entryRow, isLast && styles.entryRowLast]}
                        >
                          <View style={[styles.entryDot, { backgroundColor: entryColor }]} />
                          <Text style={styles.entryEmoji}>{TIPO_EMOJI[entry.tipo]}</Text>
                          <Text
                            style={[styles.entryDesc, isAlert && { color: entryColor, fontWeight: '600' }]}
                            numberOfLines={1}
                          >
                            {entry.descricao}
                          </Text>
                          <Text style={styles.entryTime}>
                            {formatTimestampRelativo(entry.timestamp)}
                          </Text>
                        </View>
                      );
                    })}

                    {hiddenCount > 0 && (
                      <Text style={styles.moreText}>
                        + {hiddenCount} eventos anteriores
                      </Text>
                    )}

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => handleClear(g.hortaId, g.hortaNome)}
                      >
                        <Text style={styles.clearText}>🗑 Limpar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.navigateBtn}
                        onPress={() => handleNavigate(g.hortaId, g.planetaId)}
                      >
                        <Text style={styles.navigateText}>Ir para Estufa  →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={hideAlert}
      />
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

  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Header — clicável para expandir
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  planetImg: { width: 36, height: 36, borderRadius: 18 },
  planetDot: { width: 10, height: 10, borderRadius: 5 },
  planetaNome: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 1 },
  hortaNome: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end', gap: 3 },
  alertBadge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, marginBottom: 2,
  },
  alertBadgeText: { fontSize: 11, fontWeight: 'bold' },
  headerCount: { color: COLORS.textSecondary, fontSize: 11 },
  headerTime: { color: COLORS.textDim, fontSize: 10 },
  chevron: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },

  // Chips: só ícone + número
  chipsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, paddingHorizontal: 14, paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 7, paddingVertical: 3,
    backgroundColor: COLORS.highlightGlass,
  },
  chipEmoji: { fontSize: 11 },
  chipCount: { fontSize: 12, fontWeight: '700' },

  // Entradas
  expandedSection: {
    borderTopWidth: 1, borderTopColor: COLORS.border + '60',
    paddingHorizontal: 14, paddingTop: 6, paddingBottom: 14,
  },
  entryRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border + '40',
  },
  entryRowLast: { borderBottomWidth: 0 },
  entryDot: { width: 5, height: 5, borderRadius: 3, flexShrink: 0 },
  entryEmoji: { fontSize: 13, flexShrink: 0 },
  entryDesc: { flex: 1, color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },
  entryTime: { color: COLORS.textDim, fontSize: 10, flexShrink: 0 },

  alertsSection: {
    paddingHorizontal: 14, paddingBottom: 10, gap: 5,
  },
  alertRow: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  alertDot: { width: 5, height: 5, borderRadius: 3, flexShrink: 0 },
  alertText: { fontSize: 12, flex: 1 },
  moreAlerts: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },

  emptyCard: {
    color: COLORS.textDim, fontSize: 12, textAlign: 'center',
    paddingBottom: 12, fontStyle: 'italic',
  },
  moreText: {
    color: COLORS.textDim, fontSize: 11, textAlign: 'center',
    paddingVertical: 8,
  },

  actions: {
    flexDirection: 'row', gap: 8, marginTop: 12,
  },
  clearBtn: {
    borderWidth: 1, borderColor: COLORS.critico + '70',
    borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  clearText: { color: COLORS.critico, fontSize: 13, fontWeight: '600' },
  navigateBtn: {
    flex: 1,
    backgroundColor: COLORS.ciano,
    borderRadius: 10, paddingVertical: 11, alignItems: 'center',
  },
  navigateText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
