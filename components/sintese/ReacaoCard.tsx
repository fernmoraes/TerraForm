import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, COMPOUND_COLORS, ATOM_COLORS } from '../../constants/colors';
import { ProgressBar } from '../ui/ProgressBar';
import { calcMaxUnidades } from '../../utils/chemistry';
import type { Reacao, Horta } from '../../types';

interface Props {
  reacao: Reacao;
  horta: Horta;
  onSintetizar: (unidades: number) => void;
}

export function ReacaoCard({ reacao, horta, onSintetizar }: Props) {
  const [unidades, setUnidades] = useState(1);
  const maxUnidades = calcMaxUnidades(horta, reacao);
  const color = COMPOUND_COLORS[reacao.composto];
  const canSynthesize = maxUnidades > 0 && unidades <= maxUnidades;

  const produzido = unidades * 10;
  const custoTotal = reacao.reagentes.map((r) => ({
    ...r,
    total: r.custoPor10 * unidades,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.nome, { color }]}>{reacao.nomeExibicao}</Text>
          <Text style={styles.equacao}>{reacao.equacao}</Text>
        </View>
        <View style={[styles.estoqueBadge, { borderColor: color }]}>
          <Text style={[styles.estoqueText, { color }]}>
            {horta.estoqueCompostos[reacao.composto].toFixed(0)}%
          </Text>
        </View>
      </View>

      <Text style={styles.funcao}>{reacao.funcao}</Text>

      <View style={styles.reagentesSection}>
        <Text style={styles.sectionLabel}>Reagentes disponíveis:</Text>
        {reacao.reagentes.map((r) => {
          const disponivel =
            r.tipo === 'atomo'
              ? horta.estoqueAtomos[r.chave as keyof typeof horta.estoqueAtomos]
              : horta.estoqueCompostos[r.chave as keyof typeof horta.estoqueCompostos];
          const c =
            r.tipo === 'atomo'
              ? ATOM_COLORS[r.chave as keyof typeof ATOM_COLORS]
              : COMPOUND_COLORS[r.chave as keyof typeof COMPOUND_COLORS];
          const insuficiente = disponivel < r.custoPor10 * unidades;
          return (
            <View key={String(r.chave)} style={styles.reagenteRow}>
              <Text style={[styles.reagenteSimbolo, { color: insuficiente ? COLORS.critico : c }]}>
                {r.chave}
              </Text>
              <ProgressBar value={disponivel} color={insuficiente ? COLORS.critico : c} height={4} style={styles.reagenteBar} />
              <Text style={[styles.reagenteVal, { color: insuficiente ? COLORS.critico : COLORS.textSecondary }]}>
                {disponivel.toFixed(0)}%
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.stepperRow}>
        <Text style={styles.stepperLabel}>Unidades (×10%):</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => setUnidades((u) => Math.max(1, u - 1))}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{unidades}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => setUnidades((u) => Math.min(maxUnidades || 1, u + 1))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewText}>
          Produz: <Text style={{ color }}>{produzido}%</Text>
          {' '}  Custo: {custoTotal.map((c) => `${c.total.toFixed(0)}% ${c.chave}`).join(', ')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.sintetizarBtn, { backgroundColor: canSynthesize ? color : COLORS.highlight }]}
        onPress={() => { if (canSynthesize) onSintetizar(unidades); }}
        disabled={!canSynthesize}
      >
        <Text style={[styles.sintetizarText, { color: canSynthesize ? '#000' : COLORS.textDim }]}>
          {canSynthesize ? 'Sintetizar' : 'Reagentes insuficientes'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  nome: { fontSize: 16, fontWeight: 'bold' },
  equacao: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  estoqueBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  estoqueText: { fontSize: 14, fontWeight: 'bold' },
  funcao: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 12, lineHeight: 17 },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 6 },
  reagentesSection: { marginBottom: 12 },
  reagenteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  reagenteSimbolo: { width: 40, fontSize: 12, fontWeight: 'bold' },
  reagenteBar: { flex: 1 },
  reagenteVal: { width: 36, fontSize: 11, textAlign: 'right' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  stepperLabel: { color: COLORS.text, fontSize: 13, flex: 1 },
  stepBtn: { backgroundColor: COLORS.highlight, width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stepBtnText: { color: COLORS.ciano, fontSize: 18, fontWeight: 'bold' },
  stepValue: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },
  preview: { backgroundColor: COLORS.highlight, borderRadius: 8, padding: 8, marginBottom: 12 },
  previewText: { color: COLORS.textSecondary, fontSize: 12 },
  sintetizarBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  sintetizarText: { fontWeight: 'bold', fontSize: 15 },
});
