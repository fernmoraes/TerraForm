import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { formatTimestampRelativo } from '../../utils/formatters';
import type { LogEntry } from '../../types';

const TIPO_CONFIG = {
  aplicacao: { emoji: '💧', color: COLORS.ciano },
  sintese: { emoji: '🧪', color: COLORS.roxo },
  reposicao: { emoji: '📥', color: COLORS.dourado },
  alerta: { emoji: '⚠️', color: COLORS.critico },
  crescimento: { emoji: '🌱', color: COLORS.verde },
  leitura: { emoji: '📊', color: COLORS.textSecondary },
} as const;

interface Props {
  entry: LogEntry;
  showPlanetaHorta?: boolean;
  planetaNome?: string;
  hortaNome?: string;
}

export function LogEntryItem({ entry, showPlanetaHorta, planetaNome, hortaNome }: Props) {
  const config = TIPO_CONFIG[entry.tipo] ?? TIPO_CONFIG.leitura;
  const isCritico = entry.nivel === 'critico';
  const isAtencao = entry.nivel === 'atencao';

  return (
    <View style={[styles.item, isCritico && styles.itemCritico]}>
      <View style={[styles.iconBadge, { backgroundColor: config.color + '22' }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>
      <View style={styles.content}>
        {showPlanetaHorta && (planetaNome || hortaNome) && (
          <Text style={styles.location}>
            {planetaNome}{hortaNome ? ` · ${hortaNome}` : ''}
          </Text>
        )}
        <Text style={styles.descricao} numberOfLines={2}>{entry.descricao}</Text>
        <View style={styles.bottom}>
          <Text style={styles.timestamp}>{formatTimestampRelativo(entry.timestamp)}</Text>
          {isCritico && (
            <View style={styles.nivelBadge}>
              <Text style={styles.nivelText}>CRÍTICO</Text>
            </View>
          )}
          {isAtencao && (
            <View style={[styles.nivelBadge, styles.nivelAtencao]}>
              <Text style={[styles.nivelText, { color: COLORS.atencao }]}>ATENÇÃO</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.highlight,
    alignItems: 'flex-start',
    gap: 10,
  },
  itemCritico: { backgroundColor: COLORS.critico + '11' },
  iconBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 16 },
  content: { flex: 1 },
  location: { color: COLORS.ciano, fontSize: 11, marginBottom: 2 },
  descricao: { color: COLORS.text, fontSize: 13 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  timestamp: { color: COLORS.textSecondary, fontSize: 11 },
  nivelBadge: {
    backgroundColor: COLORS.critico + '22',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  nivelAtencao: { backgroundColor: COLORS.atencao + '22' },
  nivelText: { color: COLORS.critico, fontSize: 9, fontWeight: 'bold' },
});
