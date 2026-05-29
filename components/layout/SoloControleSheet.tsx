import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS } from '../../constants/colors';
import type { Horta, CompoundKey } from '../../types';

const QTDS = [10, 20, 30];

// Compostos que afetam o pH
const PH_COMPOSTOS: {
  key: CompoundKey;
  nome: string;
  formula: string;
  delta: number;  // por 10% aplicado
  descricao: string;
  color: string;
}[] = [
  { key: 'CaCO3', nome: 'Carbonato de Cálcio', formula: 'CaCO₃', delta: +0.3, descricao: 'Alcaliniza o solo. Indica para solos ácidos (pH < 6.0).', color: COLORS.dourado },
  { key: 'NH3',   nome: 'Amônia',              formula: 'NH₃',   delta: +0.2, descricao: 'Alcaliniza levemente. Também adiciona N ao solo.',     color: COLORS.verde  },
  { key: 'H2CO3', nome: 'Ácido Carbônico',     formula: 'H₂CO₃', delta: -0.4, descricao: 'Acidifica o solo. Indica para solos alcalinos (pH > 7.0).', color: COLORS.laranja },
];

interface Props {
  visible: boolean;
  horta: Horta;
  onAplicarComposto: (composto: CompoundKey, alvo: 'solo', quantidade: number) => void;
  onClose: () => void;
}

function phStatus(ph: number): { label: string; color: string; dica: string } {
  if (ph < 5.0) return { label: 'Muito Ácido', color: COLORS.critico,  dica: 'Adicione CaCO₃ ou NH₃ para alcalinizar.' };
  if (ph < 6.0) return { label: 'Ácido',       color: COLORS.atencao,  dica: 'Adicione CaCO₃ ou NH₃ para aproximar do ideal.' };
  if (ph <= 7.0) return { label: 'Ideal',       color: COLORS.verde,    dica: 'pH dentro da faixa ideal (6.0 – 7.0).' };
  if (ph <= 7.5) return { label: 'Alcalino',    color: COLORS.atencao,  dica: 'Adicione H₂CO₃ para acidificar.' };
  return              { label: 'Muito Alcalino', color: COLORS.critico, dica: 'pH crítico. Adicione H₂CO₃ para corrigir.' };
}

export function SoloControleSheet({ visible, horta, onAplicarComposto, onClose }: Props) {
  const [qtdAgua, setQtdAgua] = useState(10);
  const [qtdPH, setQtdPH]     = useState(10);
  const [compostoSel, setCompostoSel] = useState<CompoundKey>('CaCO3');

  const solo  = horta.solo;
  const h2o   = horta.estoqueCompostos.H2O;
  const ph    = phStatus(solo.ph);
  const compostoAtual = PH_COMPOSTOS.find(c => c.key === compostoSel)!;
  const estoqueComp = horta.estoqueCompostos[compostoSel];

  // pH resultante previsto
  const phApos = Math.max(0, Math.min(14,
    solo.ph + (compostoAtual.delta * qtdPH / 10)
  ));

  const handleAgua = () => {
    if (h2o < qtdAgua) { Alert.alert('Estoque insuficiente', `H₂O disponível: ${h2o.toFixed(0)}%`); return; }
    onAplicarComposto('H2O', 'solo', qtdAgua);
  };

  const handlePH = () => {
    if (estoqueComp < qtdPH) {
      Alert.alert('Estoque insuficiente', `${compostoSel} disponível: ${estoqueComp.toFixed(0)}%`);
      return;
    }
    onAplicarComposto(compostoSel, 'solo', qtdPH);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Controle do Solo</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.close}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ── Umidade ─────────────────────── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Umidade do Solo</Text>
                <Text style={[s.valorAtual, {
                  color: solo.umidade < 15 ? COLORS.critico : solo.umidade < 25 ? COLORS.atencao : COLORS.ciano
                }]}>
                  {solo.umidade.toFixed(0)}%
                </Text>
              </View>
              <Text style={s.descricao}>Irrigação com H₂O do estoque de compostos.  Ideal: 35 – 65%.</Text>
              <View style={s.stockRow}>
                <Text style={s.stockLabel}>H₂O disponível</Text>
                <ProgressBar value={h2o} color={COLORS.ciano} height={4} style={s.stockBar} />
                <Text style={[s.stockVal, { color: COLORS.ciano }]}>{h2o.toFixed(0)}%</Text>
              </View>
              <Text style={s.efeitoText}>Efeito: +{(qtdAgua * 1.2).toFixed(0)}% umidade por {qtdAgua}% de H₂O</Text>
              <View style={s.qtdRow}>
                {QTDS.map(q => (
                  <TouchableOpacity key={q}
                    style={[s.qtdBtn, qtdAgua === q && { borderColor: COLORS.ciano, backgroundColor: COLORS.ciano + '25' }]}
                    onPress={() => setQtdAgua(q)}>
                    <Text style={[s.qtdText, qtdAgua === q && { color: COLORS.ciano, fontWeight: 'bold' }]}>{q}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.ciano }]} onPress={handleAgua}>
                <Text style={s.actionBtnText}>Irrigar Solo</Text>
              </TouchableOpacity>
            </View>

            {/* ── pH ──────────────────────────── */}
            <View style={[s.section, { borderColor: ph.color + '60' }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Controle de pH</Text>
                <View style={[s.nivelBadge, { borderColor: ph.color, backgroundColor: ph.color + '20' }]}>
                  <Text style={[s.nivelText, { color: ph.color }]}>{ph.label}</Text>
                </View>
              </View>

              {/* pH atual → após */}
              <View style={s.phRow}>
                <View style={s.phBox}>
                  <Text style={s.phLabel}>Atual</Text>
                  <Text style={[s.phValue, { color: ph.color }]}>{solo.ph.toFixed(1)}</Text>
                </View>
                <Text style={s.phArrow}>→</Text>
                <View style={s.phBox}>
                  <Text style={s.phLabel}>Após</Text>
                  <Text style={[s.phValue, { color: COLORS.ciano }]}>{phApos.toFixed(1)}</Text>
                </View>
                <View style={s.phIdeal}>
                  <Text style={s.phIdealLabel}>Ideal</Text>
                  <Text style={s.phIdealRange}>6.0 – 7.0</Text>
                </View>
              </View>

              <Text style={[s.dica, { color: ph.color }]}>{ph.dica}</Text>

              {/* Seletor de composto */}
              <Text style={s.sectionSubTitle}>Escolha o composto:</Text>
              {PH_COMPOSTOS.map(c => {
                const est = horta.estoqueCompostos[c.key];
                const isSel = compostoSel === c.key;
                return (
                  <TouchableOpacity key={c.key}
                    style={[s.compostoItem, isSel && { borderColor: c.color, backgroundColor: c.color + '14' }]}
                    onPress={() => setCompostoSel(c.key)}
                  >
                    <View style={s.compostoLeft}>
                      <View style={[s.checkbox, isSel && { backgroundColor: c.color, borderColor: c.color }]}>
                        {isSel && <Text style={s.checkMark}>✓</Text>}
                      </View>
                      <View>
                        <View style={s.compostoNameRow}>
                          <Text style={[s.compostoFormula, { color: c.color }]}>{c.formula}</Text>
                          <Text style={[s.deltaBadge, {
                            backgroundColor: (c.delta > 0 ? COLORS.verde : COLORS.laranja) + '22',
                            color: c.delta > 0 ? COLORS.verde : COLORS.laranja
                          }]}>
                            {c.delta > 0 ? `+${c.delta}` : c.delta} pH / 10%
                          </Text>
                        </View>
                        <Text style={s.compostoDesc} numberOfLines={2}>{c.descricao}</Text>
                      </View>
                    </View>
                    <View style={s.compostoEst}>
                      <ProgressBar value={est} color={c.color} height={4} />
                      <Text style={[s.compostoEstText, { color: c.color }]}>{est.toFixed(0)}%</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Quantidade */}
              <Text style={[s.sectionSubTitle, { marginTop: 12 }]}>Quantidade a aplicar:</Text>
              <View style={s.qtdRow}>
                {QTDS.map(q => (
                  <TouchableOpacity key={q}
                    style={[s.qtdBtn, qtdPH === q && { borderColor: compostoAtual.color, backgroundColor: compostoAtual.color + '25' }]}
                    onPress={() => setQtdPH(q)}>
                    <Text style={[s.qtdText, qtdPH === q && { color: compostoAtual.color, fontWeight: 'bold' }]}>{q}%</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: compostoAtual.color }]}
                onPress={handlePH}
              >
                <Text style={s.actionBtnText}>
                  Aplicar {compostoAtual.formula}  ({compostoAtual.delta > 0 ? '+' : ''}{(compostoAtual.delta * qtdPH / 10).toFixed(1)} pH)
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36, maxHeight: '90%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  close: { color: COLORS.textSecondary, fontSize: 18, padding: 4 },
  section: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, marginBottom: 12, backgroundColor: COLORS.highlight + '30',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
  sectionSubTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  valorAtual: { fontSize: 22, fontWeight: 'bold' },
  nivelBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  nivelText: { fontSize: 11, fontWeight: '600' },
  descricao: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 10 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stockLabel: { color: COLORS.textSecondary, fontSize: 11, width: 90 },
  stockBar: { flex: 1 },
  stockVal: { fontSize: 12, fontWeight: 'bold', width: 32, textAlign: 'right' },
  efeitoText: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 10, fontStyle: 'italic' },
  qtdRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  qtdBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  qtdText: { color: COLORS.textSecondary, fontSize: 14 },
  actionBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  phRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  phBox: { alignItems: 'center' },
  phLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 2 },
  phValue: { fontSize: 26, fontWeight: 'bold' },
  phArrow: { color: COLORS.textDim, fontSize: 20 },
  phIdeal: { marginLeft: 'auto' as any, alignItems: 'flex-end' },
  phIdealLabel: { color: COLORS.textSecondary, fontSize: 11 },
  phIdealRange: { color: COLORS.verde, fontSize: 13, fontWeight: '600' },
  dica: { fontSize: 12, marginBottom: 14, lineHeight: 17 },

  compostoItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginBottom: 8,
  },
  compostoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  compostoNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  compostoFormula: { fontSize: 14, fontWeight: 'bold' },
  deltaBadge: { fontSize: 10, fontWeight: '700', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  compostoDesc: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 15, maxWidth: 200 },
  compostoEst: { alignItems: 'flex-end', gap: 4, width: 60 },
  compostoEstText: { fontSize: 11, fontWeight: 'bold' },
});
