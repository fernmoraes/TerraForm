import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, NUTRIENT_COLORS, ATOM_COLORS } from '../../constants/colors';
import { calcGravityFactor } from '../../utils/gravity';
import {
  BASE_CONSUMO_NUTRIENTES,
  BASE_CONSUMO_UMIDADE_SOLO,
  BASE_CONSUMO_O2,
  BASE_PRODUCAO_CO2,
  BASE_CONSUMO_UMIDADE_AR,
  TICK_INTERVAL_MS,
} from '../../constants/simulation';
import type { Planeta } from '../../types';

const TICKS_POR_MIN = 60_000 / TICK_INTERVAL_MS; // 4 ticks/min com 15 s/tick

interface RecursoRow {
  label: string;
  simbolo: string;
  color: string;
  base: number;
  sinal?: '+' | '-'; // padrão '-'
}

const RECURSOS: RecursoRow[] = [
  { label: 'Nitrogênio',     simbolo: 'N',       color: NUTRIENT_COLORS.N,  base: BASE_CONSUMO_NUTRIENTES.N  },
  { label: 'Fósforo',        simbolo: 'P',       color: NUTRIENT_COLORS.P,  base: BASE_CONSUMO_NUTRIENTES.P  },
  { label: 'Potássio',       simbolo: 'K',       color: NUTRIENT_COLORS.K,  base: BASE_CONSUMO_NUTRIENTES.K  },
  { label: 'Cálcio',         simbolo: 'Ca',      color: NUTRIENT_COLORS.Ca, base: BASE_CONSUMO_NUTRIENTES.Ca },
  { label: 'Magnésio',       simbolo: 'Mg',      color: NUTRIENT_COLORS.Mg, base: BASE_CONSUMO_NUTRIENTES.Mg },
  { label: 'Enxofre',        simbolo: 'S',       color: NUTRIENT_COLORS.S,  base: BASE_CONSUMO_NUTRIENTES.S  },
  { label: 'Umidade solo',   simbolo: 'H₂O',    color: COLORS.ciano,       base: BASE_CONSUMO_UMIDADE_SOLO  },
  { label: 'O₂ (ar)',        simbolo: 'O₂',     color: ATOM_COLORS.O,      base: BASE_CONSUMO_O2            },
  { label: 'CO₂ (ar)',       simbolo: 'CO₂',    color: COLORS.textSecondary, base: BASE_PRODUCAO_CO2, sinal: '+' },
  { label: 'Umidade ar',     simbolo: 'Ar H₂O', color: COLORS.ciano,       base: BASE_CONSUMO_UMIDADE_AR    },
];

function gravityInfluencias(g: number): { titulo: string; detalhe: string }[] {
  const gf = calcGravityFactor(g);
  const pct = (gf * 100).toFixed(0);
  const deltaVsTerra = ((gf - 1) * 100).toFixed(0);
  const sinal = gf >= 1 ? '+' : '';

  return [
    {
      titulo: 'Consumo de recursos',
      detalhe: `${pct}% do consumo base (Terra = 100%). Diferença vs Terra: ${sinal}${deltaVsTerra}%.`,
    },
    {
      titulo: 'Distribuição de fluidos no solo',
      detalhe: g < 0.3
        ? 'Gravidade muito baixa — a capilaridade natural é insuficiente. Fluidos ficam suspensos no substrato sem drenar corretamente.'
        : g < 0.6
        ? 'Gravidade baixa — distribuição de água e nutrientes é desigual. Raízes precisam de irrigação mais precisa.'
        : 'Gravidade próxima da terrestre — distribuição de fluidos e nutrientes dentro dos parâmetros esperados.',
    },
    {
      titulo: 'Evaporação e transpiração',
      detalhe: g < 0.3
        ? 'Taxa de evaporação muito reduzida (gravidade baixa reduz convecção). Umidade tende a acumular e estabilizar.'
        : g < 0.6
        ? 'Evaporação moderadamente reduzida. Menor consumo de H₂O do que na Terra.'
        : 'Evaporação em ritmo terrestre. Irrigação regular necessária.',
    },
    {
      titulo: 'Desenvolvimento radicular',
      detalhe: g < 0.3
        ? 'Raízes crescem de forma atípica — sem pressão gravitacional suficiente, tendem a se expandir horizontalmente e perdem eficiência de absorção.'
        : g < 0.6
        ? 'Desenvolvimento radicular levemente reduzido. Absorção de nutrientes menos eficiente que na Terra.'
        : 'Crescimento radicular próximo do normal terrestre. Absorção de nutrientes eficiente.',
    },
    {
      titulo: 'Taxa de crescimento das plantas',
      detalhe: `Fator de crescimento aplicado: ${pct}% do ritmo base. Em condições ideais de solo e ar, plantas crescem ${gf < 1 ? 'mais devagar' : 'no ritmo'} que na Terra.`,
    },
  ];
}

interface Props {
  visible: boolean;
  planeta: Planeta;
  onClose: () => void;
}

export function PlanetaInfoSheet({ visible, planeta, onClose }: Props) {
  const gf = calcGravityFactor(planeta.gravidade);
  const influencias = gravityInfluencias(planeta.gravidade);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerSub}>Dados Técnicos</Text>
              <Text style={[s.headerTitle, { color: planeta.cor }]}>{planeta.nome}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Gravidade */}
            <View style={[s.card, { borderColor: planeta.cor + '60' }]}>
              <View style={s.gravRow}>
                <View style={s.gravBox}>
                  <Text style={s.gravLabel}>Gravidade</Text>
                  <Text style={[s.gravValue, { color: planeta.cor }]}>{planeta.gravidade.toFixed(2)} g</Text>
                </View>
                <View style={s.gravBox}>
                  <Text style={s.gravLabel}>Fator aplicado</Text>
                  <Text style={[s.gravValue, { color: COLORS.ciano }]}>{gf.toFixed(3)}</Text>
                </View>
                <View style={s.gravBox}>
                  <Text style={s.gravLabel}>Vs Terra</Text>
                  <Text style={[s.gravValue, { color: gf < 1 ? COLORS.atencao : COLORS.verde }]}>
                    {(gf * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              <Text style={s.gravFormula}>
                fator = 0.70 + {planeta.gravidade.toFixed(2)} × 0.30 = {gf.toFixed(3)}
              </Text>
            </View>

            {/* Tabela de consumo */}
            <Text style={s.sectionTitle}>Consumo por Tick (intervalo: {TICK_INTERVAL_MS / 1000}s)</Text>
            <View style={s.card}>
              {/* Header da tabela */}
              <View style={[s.tableRow, s.tableHeader]}>
                <Text style={[s.tableCell, s.colRecurso, s.tableHeaderText]}>Recurso</Text>
                <Text style={[s.tableCell, s.colBase, s.tableHeaderText]}>Base</Text>
                <Text style={[s.tableCell, s.colAtual, s.tableHeaderText]}>Com {planeta.nome}</Text>
                <Text style={[s.tableCell, s.colMin, s.tableHeaderText]}>/min</Text>
              </View>

              {RECURSOS.map((r) => {
                const atual = r.base * gf;
                const porMin = atual * TICKS_POR_MIN;
                const sinal = r.sinal === '+' ? '+' : '−';
                return (
                  <View key={r.simbolo} style={s.tableRow}>
                    <View style={[s.tableCell, s.colRecurso, s.recursoCell]}>
                      <View style={[s.simboloBadge, { borderColor: r.color + '70' }]}>
                        <Text style={[s.simboloText, { color: r.color }]}>{r.simbolo}</Text>
                      </View>
                    </View>
                    <Text style={[s.tableCell, s.colBase]}>
                      {sinal}{r.base.toFixed(3)}%
                    </Text>
                    <Text style={[s.tableCell, s.colAtual, { color: r.color }]}>
                      {sinal}{atual.toFixed(3)}%
                    </Text>
                    <Text style={[s.tableCell, s.colMin]}>
                      {sinal}{porMin.toFixed(2)}%
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Influências da gravidade */}
            <Text style={s.sectionTitle}>Influências da Gravidade</Text>
            {influencias.map((inf, i) => (
              <View key={i} style={s.infCard}>
                <View style={s.infHeader}>
                  <View style={[s.infDot, { backgroundColor: planeta.cor }]} />
                  <Text style={[s.infTitulo, { color: planeta.cor }]}>{inf.titulo}</Text>
                </View>
                <Text style={s.infDetalhe}>{inf.detalhe}</Text>
              </View>
            ))}

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  headerSub: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  closeBtn: { color: COLORS.textSecondary, fontSize: 20, padding: 4 },

  card: {
    backgroundColor: COLORS.highlight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gravRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  gravBox: { alignItems: 'center', flex: 1 },
  gravLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  gravValue: { fontSize: 22, fontWeight: 'bold' },
  gravFormula: {
    color: COLORS.textDim,
    fontSize: 11,
    fontFamily: 'monospace' as const,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },

  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  tableHeader: { borderBottomWidth: 1.5, borderBottomColor: COLORS.border },
  tableHeaderText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
  tableCell: { fontSize: 12 },
  colRecurso: { width: 60 },
  colBase: { flex: 1, color: COLORS.textSecondary, textAlign: 'center' },
  colAtual: { flex: 1, fontWeight: '700', textAlign: 'center' },
  colMin: { flex: 1, color: COLORS.textSecondary, textAlign: 'right' },
  recursoCell: { flexDirection: 'row', alignItems: 'center' },
  simboloBadge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  simboloText: { fontSize: 10, fontWeight: 'bold' },
  dimText: { color: COLORS.textDim },

  infCard: {
    backgroundColor: COLORS.highlight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infDot: { width: 8, height: 8, borderRadius: 4 },
  infTitulo: { fontSize: 13, fontWeight: '700' },
  infDetalhe: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
});
