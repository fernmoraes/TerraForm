import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { CustomAlert } from '../ui/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS } from '../../constants/colors';
import type { Horta } from '../../types';

const QTDS = [10, 20, 30];

interface Props {
  visible: boolean;
  horta: Horta;
  onAplicarH2OAr: (quantidade: number) => void;
  onInjetarO2: (quantidade: number) => void;
  onClose: () => void;
}

function valor(v: number, decimais = 0) {
  return v.toFixed(decimais);
}

function nivelO2(v: number) {
  if (v < 16) return { label: 'Crítico', color: COLORS.critico };
  if (v < 19) return { label: 'Baixo', color: COLORS.atencao };
  if (v > 26) return { label: 'Elevado', color: COLORS.atencao };
  return { label: 'Ideal', color: COLORS.verde };
}

function nivelCO2(v: number) {
  if (v > 1.5) return { label: 'Crítico', color: COLORS.critico };
  if (v > 0.5) return { label: 'Elevado', color: COLORS.atencao };
  return { label: 'Normal', color: COLORS.verde };
}

function nivelHumidade(v: number) {
  if (v < 20 || v > 85) return { label: 'Crítica', color: COLORS.critico };
  if (v < 30 || v > 80) return { label: 'Atenção', color: COLORS.atencao };
  return { label: 'Ideal', color: COLORS.verde };
}

export function AtmosferaSheet({ visible, horta, onAplicarH2OAr, onInjetarO2, onClose }: Props) {
  const [qtdCO2, setQtdCO2]           = useState(10);
  const [qtdO2, setQtdO2]             = useState(10);
  const [qtdHumidade, setQtdHumidade] = useState(10);
  const { alertVisible, alertTitle, alertMessage, alertButtons, showAlert, hideAlert } = useCustomAlert();

  const ar   = horta.ar;
  const h2o  = horta.estoqueCompostos.H2O;
  const gO   = horta.estoqueAtomos.O;

  const nO2  = nivelO2(ar.o2);
  const nCO2 = nivelCO2(ar.co2);
  const nHum = nivelHumidade(ar.umidade);

  const aplicarCO2 = () => {
    if (h2o < qtdCO2) { showAlert('Estoque insuficiente', `H₂O disponível: ${h2o.toFixed(0)}%`); return; }
    onAplicarH2OAr(qtdCO2);
  };

  const aplicarO2 = () => {
    if (gO < qtdO2) { showAlert('Estoque insuficiente', `Galão O disponível: ${gO.toFixed(0)}%`); return; }
    onInjetarO2(qtdO2);
  };

  const aplicarHumidade = () => {
    if (h2o < qtdHumidade) { showAlert('Estoque insuficiente', `H₂O disponível: ${h2o.toFixed(0)}%`); return; }
    onAplicarH2OAr(qtdHumidade);
  };

  return (
    <>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Controle da Atmosfera</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.close}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

            {/* ── CO₂ ─────────────────────────── */}
            <View style={[s.section, { borderColor: nCO2.color + '60' }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>CO₂</Text>
                <View style={[s.nivelBadge, { borderColor: nCO2.color, backgroundColor: nCO2.color + '20' }]}>
                  <Text style={[s.nivelText, { color: nCO2.color }]}>{nCO2.label}</Text>
                </View>
              </View>
              <Text style={s.valorAtual}>{valor(ar.co2, 2)}%</Text>
              <Text style={s.descricao}>CO₂ + H₂O → H₂CO₃ — a água absorve CO₂ do ar, reduzindo sua concentração.</Text>
              <View style={s.stockRow}>
                <Text style={s.stockLabel}>H₂O disponível</Text>
                <ProgressBar value={h2o} color={COLORS.ciano} height={4} style={s.stockBar} />
                <Text style={[s.stockVal, { color: COLORS.ciano }]}>{h2o.toFixed(0)}%</Text>
              </View>
              <Text style={s.efeitoText}>Efeito: −{(qtdCO2 * 0.05).toFixed(2)}% CO₂  ·  +{(qtdCO2 * 0.6).toFixed(0)}% umidade</Text>
              <View style={s.qtdRow}>
                {QTDS.map(q => (
                  <TouchableOpacity key={q} style={[s.qtdBtn, qtdCO2 === q && { borderColor: COLORS.ciano, backgroundColor: COLORS.ciano + '25' }]}
                    onPress={() => setQtdCO2(q)}>
                    <Text style={[s.qtdText, qtdCO2 === q && { color: COLORS.ciano, fontWeight: 'bold' }]}>{q}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.ciano }]} onPress={aplicarCO2}>
                <Text style={s.actionBtnText}>Absorver CO₂</Text>
              </TouchableOpacity>
            </View>

            {/* ── O₂ ──────────────────────────── */}
            <View style={[s.section, { borderColor: nO2.color + '60' }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>O₂</Text>
                <View style={[s.nivelBadge, { borderColor: nO2.color, backgroundColor: nO2.color + '20' }]}>
                  <Text style={[s.nivelText, { color: nO2.color }]}>{nO2.label}</Text>
                </View>
              </View>
              <Text style={s.valorAtual}>{valor(ar.o2, 1)}%  <Text style={s.ideal}>(ideal 19–22%)</Text></Text>
              <Text style={s.descricao}>Injeta oxigênio puro do galão diretamente na atmosfera da estufa.</Text>
              <View style={s.stockRow}>
                <Text style={s.stockLabel}>Galão O</Text>
                <ProgressBar value={gO} color={COLORS.ciano} height={4} style={s.stockBar} />
                <Text style={[s.stockVal, { color: COLORS.ciano }]}>{gO.toFixed(0)}%</Text>
              </View>
              <Text style={s.efeitoText}>Efeito: +{(qtdO2 * 0.08).toFixed(2)}% O₂ no ar</Text>
              <View style={s.qtdRow}>
                {QTDS.map(q => (
                  <TouchableOpacity key={q} style={[s.qtdBtn, qtdO2 === q && { borderColor: COLORS.verde, backgroundColor: COLORS.verde + '25' }]}
                    onPress={() => setQtdO2(q)}>
                    <Text style={[s.qtdText, qtdO2 === q && { color: COLORS.verde, fontWeight: 'bold' }]}>{q}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.verde }]} onPress={aplicarO2}>
                <Text style={s.actionBtnText}>Injetar O₂</Text>
              </TouchableOpacity>
            </View>

            {/* ── Umidade ─────────────────────── */}
            <View style={[s.section, { borderColor: nHum.color + '60' }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Umidade</Text>
                <View style={[s.nivelBadge, { borderColor: nHum.color, backgroundColor: nHum.color + '20' }]}>
                  <Text style={[s.nivelText, { color: nHum.color }]}>{nHum.label}</Text>
                </View>
              </View>
              <Text style={s.valorAtual}>{valor(ar.umidade)}%  <Text style={s.ideal}>(ideal 50–70%)</Text></Text>
              <Text style={s.descricao}>Vaporiza H₂O no ar para aumentar a umidade relativa da estufa.</Text>
              <View style={s.stockRow}>
                <Text style={s.stockLabel}>H₂O disponível</Text>
                <ProgressBar value={h2o} color={COLORS.ciano} height={4} style={s.stockBar} />
                <Text style={[s.stockVal, { color: COLORS.ciano }]}>{h2o.toFixed(0)}%</Text>
              </View>
              <Text style={s.efeitoText}>Efeito: +{(qtdHumidade * 0.6).toFixed(0)}% umidade no ar</Text>
              <View style={s.qtdRow}>
                {QTDS.map(q => (
                  <TouchableOpacity key={q} style={[s.qtdBtn, qtdHumidade === q && { borderColor: COLORS.dourado, backgroundColor: COLORS.dourado + '25' }]}
                    onPress={() => setQtdHumidade(q)}>
                    <Text style={[s.qtdText, qtdHumidade === q && { color: COLORS.dourado, fontWeight: 'bold' }]}>{q}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: COLORS.dourado }]} onPress={aplicarHumidade}>
                <Text style={s.actionBtnText}>Vaporizar H₂O</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>

    <CustomAlert
      visible={alertVisible}
      title={alertTitle}
      message={alertMessage}
      buttons={alertButtons}
      onClose={hideAlert}
    />
  </>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36, maxHeight: '92%', flex: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  close: { color: COLORS.textSecondary, fontSize: 18, padding: 4 },

  section: {
    borderWidth: 1, borderRadius: 12,
    padding: 14, marginBottom: 12, backgroundColor: COLORS.highlight + '30',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: 'bold' },
  nivelBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  nivelText: { fontSize: 11, fontWeight: '600' },
  valorAtual: { color: COLORS.ciano, fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  ideal: { color: COLORS.textSecondary, fontSize: 13, fontWeight: 'normal' },
  descricao: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 10 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stockLabel: { color: COLORS.textSecondary, fontSize: 11, width: 80 },
  stockBar: { flex: 1 },
  stockVal: { fontSize: 12, fontWeight: 'bold', width: 32, textAlign: 'right' },
  efeitoText: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 10, fontStyle: 'italic' },
  qtdRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  qtdBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  qtdText: { color: COLORS.textSecondary, fontSize: 14 },
  actionBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  actionBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
