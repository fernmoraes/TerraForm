import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { formatTimestampRelativo } from '../../utils/formatters';
import type { LogEntry, TipoLog } from '../../types';

type TipoConfig = { emoji: string; label: string; color: string };

const TIPO_CONFIG: Record<TipoLog, TipoConfig> = {
  aplicacao:   { emoji: '💧', label: 'Aplicação',   color: COLORS.ciano },
  sintese:     { emoji: '🧪', label: 'Síntese',     color: COLORS.roxo },
  reposicao:   { emoji: '📥', label: 'Reposição',   color: COLORS.dourado },
  alerta:      { emoji: '⚠️', label: 'Alerta',      color: COLORS.critico },
  crescimento: { emoji: '🌱', label: 'Crescimento', color: COLORS.verde },
  leitura:     { emoji: '📊', label: 'Leitura',     color: COLORS.textSecondary },
};

interface Props {
  entry: LogEntry;
  showPlanetaHorta?: boolean;
  planetaNome?: string;
  hortaNome?: string;
  onPress?: () => void;
}

export function LogEntryItem({ entry, showPlanetaHorta, planetaNome, hortaNome, onPress }: Props) {
  const cfg = TIPO_CONFIG[entry.tipo] ?? TIPO_CONFIG.leitura;
  const isCritico = entry.nivel === 'critico';
  const isAtencao = entry.nivel === 'atencao';
  const alertColor = isCritico ? COLORS.critico : isAtencao ? COLORS.atencao : null;

  return (
    <TouchableOpacity
      style={[styles.card, alertColor && { borderColor: alertColor + '60', backgroundColor: alertColor + '08' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
    >
      {/* Linha superior: tipo + timestamp */}
      <View style={styles.topRow}>
        <View style={[styles.typePill, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55' }]}>
          <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
          <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTimestampRelativo(entry.timestamp)}</Text>
      </View>

      {/* Descrição principal */}
      <Text style={styles.descricao}>{entry.descricao}</Text>

      {/* Linha inferior: localização + badge de nível */}
      {(showPlanetaHorta || alertColor) && (
        <View style={styles.bottomRow}>
          {showPlanetaHorta && planetaNome && (
            <View style={styles.locationPill}>
              <Text style={styles.locationText}>
                {planetaNome}{hortaNome ? `  ·  ${hortaNome}` : ''}
              </Text>
            </View>
          )}
          {alertColor && (
            <View style={[styles.nivelBadge, { backgroundColor: alertColor + '22', borderColor: alertColor }]}>
              <Text style={[styles.nivelText, { color: alertColor }]}>
                {isCritico ? '⚠ CRÍTICO' : '! ATENÇÃO'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Seta de navegação (quando clicável) */}
      {onPress && (
        <Text style={styles.navArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeEmoji: { fontSize: 12 },
  typeLabel: { fontSize: 12, fontWeight: '600' },
  timestamp: { color: COLORS.textDim, fontSize: 11 },
  descricao: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  locationPill: {
    backgroundColor: COLORS.highlight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  locationText: { color: COLORS.textSecondary, fontSize: 11 },
  nivelBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  nivelText: { fontSize: 10, fontWeight: 'bold' },
  navArrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    color: COLORS.textDim,
    fontSize: 20,
  },
});
