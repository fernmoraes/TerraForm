import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { GravityIndicator } from '../../components/horta/GravityIndicator';
import { SoloQualidadeCard } from '../../components/horta/SoloQualidadeCard';
import { ArQualidadeCard } from '../../components/horta/ArQualidadeCard';
import { NutrienteCard } from '../../components/horta/NutrienteCard';
import { GallonCard } from '../../components/estoque/GallonCard';
import { CompostoCard } from '../../components/estoque/CompostoCard';
import { ReacaoCard } from '../../components/sintese/ReacaoCard';
import { PlanetaInfoSheet } from '../../components/layout/PlanetaInfoSheet';
import { SoloControleSheet } from '../../components/layout/SoloControleSheet';
import { AtmosferaSheet } from '../../components/layout/AtmosferaSheet';
import { NutrirSoloSheet } from '../../components/layout/NutrirSoloSheet';
import { COLORS } from '../../constants/colors';
import { THRESHOLDS } from '../../constants/thresholds';
import {
  TUTORIAL_HORTA_INICIAL,
  TUTORIAL_PLANETA,
  TUTORIAL_INITIAL_LOGS,
} from '../../data/tutorialSeed';
import { applyCompostoToHorta, synthesizeComposto } from '../../utils/chemistry';
import { calcSoloQualidade, calcArQualidade } from '../../utils/agriculture';
import { clamp, generateId } from '../../utils/formatters';
import { REACTIONS } from '../../data/reactions';
import type {
  Horta, LogEntry, SoloNutrienteKey, AtomKey,
  CompoundKey, AplicacaoAlvo, NivelAlerta,
} from '../../types';

const SOLO_NUTRIENTES: SoloNutrienteKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
const ATOM_KEYS: AtomKey[] = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'O', 'H', 'C'];
const COMPOUND_KEYS: CompoundKey[] = ['H2O', 'NH3', 'CaCO3', 'H2CO3'];

const NUTRIENTE_NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio', Ca: 'Cálcio', Mg: 'Magnésio', S: 'Enxofre',
};

const TIPO_EMOJI: Record<string, string> = {
  aplicacao: '💧', sintese: '🧪', reposicao: '📥',
  alerta: '⚠️', crescimento: '🌱', leitura: '📊',
};
const TIPO_COLOR: Record<string, string> = {
  aplicacao: COLORS.ciano, sintese: COLORS.roxo, reposicao: COLORS.dourado,
  alerta: COLORS.critico, crescimento: COLORS.verde, leitura: COLORS.textSecondary,
};

type StepId =
  | 'intro' | 'planeta' | 'solo' | 'atmosfera' | 'nutrientes'
  | 'estoque' | 'repor' | 'sintese' | 'logs' | 'fim';

type TutorialStep = {
  id: StepId;
  num: number;
  titulo: string;
  descricao: string;
  dica?: string;
};

const STEPS: TutorialStep[] = [
  {
    id: 'intro', num: 1,
    titulo: 'Horta em Estado Crítico',
    descricao: 'Esta é a Estufa Demo-Ares em Marte. Ela possui múltiplos problemas críticos. O tutorial vai guiá-lo por cada área do app para resolver cada um.',
  },
  {
    id: 'planeta', num: 2,
    titulo: 'Condições do Planeta',
    descricao: 'Cada planeta tem uma gravidade que afeta o consumo de recursos. Marte tem 0.38g — isso reduz o consumo de nutrientes, água e O₂ em relação à Terra.',
    dica: 'Toque no badge de Marte para ver os dados técnicos completos.',
  },
  {
    id: 'solo', num: 3,
    titulo: 'Tratar o Solo',
    descricao: 'O solo está com pH 8.2 (muito alcalino — ideal 6.0–7.0) e umidade de 15% (crítico). Corrija o pH com H₂CO₃ e irrigue com H₂O.',
    dica: 'Toque em "Controle do Solo" para abrir o painel de tratamento.',
  },
  {
    id: 'atmosfera', num: 4,
    titulo: 'Tratar a Atmosfera Interna',
    descricao: 'O₂ está em 15.5% — nível crítico para as plantas (ideal 19–22%). O CO₂ também está elevado. Injete O₂ para normalizar a atmosfera.',
    dica: 'Toque em "Controle do Ar" para abrir o painel da atmosfera.',
  },
  {
    id: 'nutrientes', num: 5,
    titulo: 'Alimentar Nutrientes do Solo',
    descricao: 'Nitrogênio (12%) e Fósforo (8%) estão críticos no solo. Aplique-os diretamente dos galões correspondentes para nutrir as plantas.',
    dica: 'Toque nos cards N ou P para aplicar nutrientes no solo.',
  },
  {
    id: 'estoque', num: 6,
    titulo: 'Ver Estoque',
    descricao: 'Aqui estão os 9 galões de elementos brutos e os 4 compostos sintetizados disponíveis para esta estufa. Os galões estão abastecidos — o composto NH₃ (5%) está crítico e pode ser sintetizado na aba Síntese.',
  },
  {
    id: 'repor', num: 7,
    titulo: 'Reabastecer Estoque',
    descricao: 'No dia a dia, os galões se esgotam com as aplicações. Qualquer galão pode ser restaurado a 100% com um toque — simula o reabastecimento logístico da base.',
    dica: 'Toque em "Repor" em qualquer galão para praticar o reabastecimento.',
  },
  {
    id: 'sintese', num: 8,
    titulo: 'Criar Nova Síntese',
    descricao: 'Combine elementos brutos para criar compostos essenciais. H₂O é indispensável — usada para irrigar o solo, controlar atmosfera e sintetizar H₂CO₃.',
    dica: 'Toque em "Sintetizar" para produzir compostos. Cada unidade = 10%.',
  },
  {
    id: 'logs', num: 9,
    titulo: 'Ver os Logs',
    descricao: 'Os logs registram o histórico completo da estufa: alertas automáticos, aplicações, sínteses, reposições e avanços de crescimento das plantas.',
    dica: 'Os registros abaixo foram gerados ao longo deste tutorial.',
  },
  {
    id: 'fim', num: 10,
    titulo: 'Tutorial Concluído!',
    descricao: 'Você aprendeu a usar todas as áreas do TerraForm. Monitore os alertas, mantenha os recursos abastecidos e suas plantas prosperarão.',
  },
];

// ── Alert helpers ─────────────────────────────────────────────────────────────

type Alerta = { texto: string; nivel: NivelAlerta };

function buildAlertasSimple(h: Horta): Alerta[] {
  const list: Alerta[] = [];
  (Object.keys(h.solo.nutrientes) as SoloNutrienteKey[]).forEach((k) => {
    const v = h.solo.nutrientes[k];
    if (v < THRESHOLDS.nutrienteCritico)
      list.push({ nivel: 'critico', texto: `${NUTRIENTE_NOMES[k]} crítico — ${v.toFixed(0)}%` });
    else if (v < THRESHOLDS.nutrienteAtencao)
      list.push({ nivel: 'atencao', texto: `${NUTRIENTE_NOMES[k]} baixo — ${v.toFixed(0)}%` });
  });
  if (h.solo.umidade < THRESHOLDS.umidadeSoloMin)
    list.push({ nivel: 'critico', texto: `Umidade do solo crítica — ${h.solo.umidade.toFixed(0)}%` });
  else if (h.solo.umidade < THRESHOLDS.umidadeSoloAtencao)
    list.push({ nivel: 'atencao', texto: `Umidade do solo baixa — ${h.solo.umidade.toFixed(0)}%` });
  if (h.solo.ph < THRESHOLDS.phMinCritico || h.solo.ph > THRESHOLDS.phMaxCritico)
    list.push({ nivel: 'critico', texto: `pH do solo crítico — ${h.solo.ph.toFixed(1)}` });
  else if (h.solo.ph < THRESHOLDS.phMinAtencao || h.solo.ph > THRESHOLDS.phMaxAtencao)
    list.push({ nivel: 'atencao', texto: `pH fora do ideal — ${h.solo.ph.toFixed(1)}` });
  if (h.ar.o2 < THRESHOLDS.o2MinCritico)
    list.push({ nivel: 'critico', texto: `O₂ crítico — ${h.ar.o2.toFixed(1)}%` });
  else if (h.ar.o2 < THRESHOLDS.o2MinAtencao)
    list.push({ nivel: 'atencao', texto: `O₂ baixo — ${h.ar.o2.toFixed(1)}%` });
  if (h.ar.co2 > THRESHOLDS.co2MaxCritico)
    list.push({ nivel: 'critico', texto: `CO₂ perigoso — ${h.ar.co2.toFixed(2)}%` });
  else if (h.ar.co2 > THRESHOLDS.co2MaxAtencao)
    list.push({ nivel: 'atencao', texto: `CO₂ elevado — ${h.ar.co2.toFixed(2)}%` });
  (Object.keys(h.estoqueAtomos) as AtomKey[]).forEach((k) => {
    const v = h.estoqueAtomos[k];
    if (v < THRESHOLDS.atomoCritico)
      list.push({ nivel: 'critico', texto: `Galão ${k} crítico — ${v.toFixed(0)}%` });
    else if (v < THRESHOLDS.atomoAtencao)
      list.push({ nivel: 'atencao', texto: `Galão ${k} em atenção — ${v.toFixed(0)}%` });
  });
  return list.sort((a, b) => (a.nivel === 'critico' ? -1 : b.nivel === 'critico' ? 1 : 0));
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TutorialPratico() {
  const [step, setStep] = useState(0);
  const [horta, setHorta] = useState<Horta>(TUTORIAL_HORTA_INICIAL);
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(TUTORIAL_INITIAL_LOGS);

  const [planetaInfoVisible, setPlanetaInfoVisible] = useState(false);
  const [soloControleVisible, setSoloControleVisible] = useState(false);
  const [atmosferaVisible, setAtmosferaVisible] = useState(false);
  const [sheetNutriente, setSheetNutriente] = useState<SoloNutrienteKey | null>(null);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const anyModalOpen =
    planetaInfoVisible || soloControleVisible || atmosferaVisible || sheetNutriente !== null;

  // Auto-open the relevant modal when entering its step; close others
  useEffect(() => {
    setPlanetaInfoVisible(false);
    setSoloControleVisible(false);
    setAtmosferaVisible(false);
    setSheetNutriente(null);
  }, [current.id]);

  // ── Local action handlers ──────────────────────────────────────────────────

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp' | 'planetaId' | 'hortaId'>) => {
    setLocalLogs((prev) => [
      { id: generateId(), timestamp: new Date().toISOString(), planetaId: 'marte', hortaId: 'tutorial-demo', ...entry },
      ...prev,
    ]);
  };

  const handleAplicarAtomNoSolo = (atomo: SoloNutrienteKey, quantidade: number) => {
    setHorta((prev) => {
      const espaco = Math.max(0, 100 - prev.solo.nutrientes[atomo]);
      const disponivel = prev.estoqueAtomos[atomo];
      const real = Math.min(quantidade, disponivel, espaco);
      if (real <= 0) return prev;
      const novoNutrientes = {
        ...prev.solo.nutrientes,
        [atomo]: clamp(prev.solo.nutrientes[atomo] + real, 0, 100),
      };
      const novoSolo = {
        ...prev.solo,
        nutrientes: novoNutrientes,
        qualidade: calcSoloQualidade(novoNutrientes, prev.solo.ph, prev.solo.umidade),
      };
      addLog({ tipo: 'aplicacao', descricao: `${real.toFixed(0)}% de ${atomo} aplicado no solo` });
      return {
        ...prev,
        estoqueAtomos: { ...prev.estoqueAtomos, [atomo]: clamp(disponivel - real, 0, 100) },
        solo: novoSolo,
      };
    });
  };

  const handleAplicarComposto = (composto: CompoundKey, alvo: AplicacaoAlvo, quantidade: number) => {
    setHorta((prev) => {
      const updated = applyCompostoToHorta(prev, composto, alvo, quantidade);
      addLog({
        tipo: 'aplicacao',
        descricao: `${quantidade}% de ${composto} aplicado no ${alvo === 'solo' ? 'solo' : 'ar'}`,
      });
      return updated;
    });
  };

  const handleInjetarO2 = (quantidade: number) => {
    setHorta((prev) => {
      const disponivel = prev.estoqueAtomos.O;
      const real = Math.min(quantidade, disponivel);
      if (real <= 0) return prev;
      const novoAr = {
        ...prev.ar,
        o2: clamp(prev.ar.o2 + real * 0.08, 0, 30),
      };
      novoAr.qualidade = calcArQualidade(novoAr.o2, novoAr.co2, novoAr.umidade);
      addLog({
        tipo: 'aplicacao',
        descricao: `${real.toFixed(0)}% de O injetado no ar (+${(real * 0.08).toFixed(2)}% O₂)`,
      });
      return {
        ...prev,
        estoqueAtomos: { ...prev.estoqueAtomos, O: clamp(disponivel - real, 0, 100) },
        ar: novoAr,
      };
    });
  };

  const handleReporGalao = (atomo: AtomKey) => {
    setHorta((prev) => {
      addLog({ tipo: 'reposicao', descricao: `Galão de ${atomo} reposto a 100%` });
      return { ...prev, estoqueAtomos: { ...prev.estoqueAtomos, [atomo]: 100 } };
    });
  };

  const handleSintetizar = (compostoKey: CompoundKey, unidades: number) => {
    const reacao = REACTIONS.find((r) => r.composto === compostoKey);
    if (!reacao) return;
    setHorta((prev) => {
      const updated = synthesizeComposto(prev, reacao, unidades);
      addLog({
        tipo: 'sintese',
        descricao: `Sintetizado ${unidades * 10}% de ${reacao.nomeExibicao} (${reacao.composto})`,
      });
      return updated;
    });
  };

  // ── Step content ──────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (current.id) {
      case 'intro': {
        const alertas = buildAlertasSimple(horta);
        const numCrit = alertas.filter((a) => a.nivel === 'critico').length;
        const dominante = numCrit > 0 ? COLORS.critico : COLORS.atencao;
        return (
          <View style={s.stepContent}>
            <View style={[s.alertaBox, { borderColor: dominante, backgroundColor: dominante + '12' }]}>
              <View style={s.alertaTitleRow}>
                <View style={[s.alertaBadge, { backgroundColor: dominante }]}>
                  <Text style={s.alertaBadgeText}>!</Text>
                </View>
                <Text style={[s.alertaTitleText, { color: dominante }]}>
                  {numCrit} problema{numCrit !== 1 ? 's críticos' : ' crítico'} detectados
                </Text>
              </View>
              {alertas.slice(0, 8).map((a, i) => (
                <View key={i} style={s.alertaRow}>
                  <View style={[s.alertaDot, { backgroundColor: a.nivel === 'critico' ? COLORS.critico : COLORS.atencao }]} />
                  <Text style={[s.alertaRowText, { color: a.nivel === 'critico' ? COLORS.critico : COLORS.atencao }]}>
                    {a.texto}
                  </Text>
                </View>
              ))}
              {alertas.length > 8 && (
                <Text style={s.moreText}>+{alertas.length - 8} alertas</Text>
              )}
            </View>
            <SoloQualidadeCard solo={horta.solo} />
            <ArQualidadeCard ar={horta.ar} />
          </View>
        );
      }

      case 'planeta':
        return (
          <View style={s.stepContent}>
            <GravityIndicator
              gravidade={TUTORIAL_PLANETA.gravidade}
              planetaNome={TUTORIAL_PLANETA.nome}
              planetaId={TUTORIAL_PLANETA.id}
              onPress={() => setPlanetaInfoVisible(true)}
            />
            <View style={s.infoCard}>
              <Text style={s.infoCardTitle}>Como a gravidade afeta a estufa</Text>
              <Text style={s.infoCardText}>
                {'• '}Fator de gravidade: <Text style={{ color: COLORS.ciano }}>0.814</Text>
                {' '}(82% do consumo da Terra){'\n'}
                {'• '}Consumo de nutrientes, água e O₂ é reduzido{'\n'}
                {'• '}Distribuição de fluidos no solo é menos eficiente{'\n'}
                {'• '}Crescimento das plantas é mais lento que na Terra{'\n'}
                {'• '}Taxa de evaporação moderadamente reduzida
              </Text>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoCardTitle}>Fórmula do fator de gravidade</Text>
              <Text style={[s.infoCardText, { fontFamily: 'monospace' as const }]}>
                fator = 0.70 + gravidade × 0.30{'\n'}
                fator = 0.70 + 0.38 × 0.30 = 0.814
              </Text>
            </View>
          </View>
        );

      case 'solo':
        return (
          <View style={s.stepContent}>
            <SoloQualidadeCard solo={horta.solo} onPress={() => setSoloControleVisible(true)} />
            <View style={s.infoCard}>
              <Text style={s.infoCardTitle}>Como corrigir este solo</Text>
              <Text style={s.infoCardText}>
                {'• '}pH 8.2 → aplique <Text style={{ color: COLORS.laranja }}>H₂CO₃</Text>
                {' '}para acidificar (−0.4 pH por 10%){'\n'}
                {'• '}Umidade 15% → aplique <Text style={{ color: COLORS.ciano }}>H₂O</Text>
                {' '}para irrigar (+12% por 10%){'\n'}
                {'• '}Alvo ideal: pH entre 6.0–7.0 e umidade 40–85%{'\n'}
                {'• '}Compostos são consumidos do estoque ao aplicar
              </Text>
            </View>
          </View>
        );

      case 'atmosfera':
        return (
          <View style={s.stepContent}>
            <ArQualidadeCard ar={horta.ar} onPress={() => setAtmosferaVisible(true)} />
            <View style={s.infoCard}>
              <Text style={s.infoCardTitle}>Como corrigir a atmosfera</Text>
              <Text style={s.infoCardText}>
                {'• '}O₂ 15.5% → injete <Text style={{ color: COLORS.verde }}>O do galão</Text>
                {' '}(+0.8% O₂ por 10% injetado){'\n'}
                {'• '}CO₂ 0.15% → aplique <Text style={{ color: COLORS.ciano }}>H₂O</Text>
                {' '}para absorver (CO₂ + H₂O → H₂CO₃){'\n'}
                {'• '}H₂O no ar também aumenta a umidade{'\n'}
                {'• '}Ideal: O₂ 19–22%, CO₂ ≤ 0.08%, umidade 40–70%
              </Text>
            </View>
          </View>
        );

      case 'nutrientes':
        return (
          <View style={s.stepContent}>
            <View style={s.nutrientesGrid}>
              {SOLO_NUTRIENTES.map((n) => (
                <NutrienteCard
                  key={n}
                  nutriente={n}
                  value={horta.solo.nutrientes[n]}
                  onPress={() => setSheetNutriente(n)}
                />
              ))}
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoCardTitle}>Sobre os nutrientes do solo</Text>
              <Text style={s.infoCardText}>
                {'• '}Cada nutriente tem uma função específica no crescimento{'\n'}
                {'• '}N: crescimento foliar · P: raízes e floração{'\n'}
                {'• '}K: frutos · Ca: estrutura · Mg: clorofila · S: proteínas{'\n'}
                {'• '}Aplicar debita do galão e credita no solo diretamente
              </Text>
            </View>
          </View>
        );

      case 'estoque':
        return (
          <View style={s.stepContent}>
            <Text style={s.sectionLabel}>Elementos Brutos (9 galões)</Text>
            {ATOM_KEYS.map((key) => (
              <GallonCard
                key={key}
                atomKey={key}
                value={horta.estoqueAtomos[key]}
                onRepor={() => handleReporGalao(key)}
              />
            ))}
            <Text style={[s.sectionLabel, { marginTop: 8 }]}>Compostos Sintetizados</Text>
            {COMPOUND_KEYS.map((key) => (
              <CompostoCard
                key={key}
                compoundKey={key}
                value={horta.estoqueCompostos[key]}
                onAplicar={(alvo, qtd) => handleAplicarComposto(key, alvo, qtd)}
              />
            ))}
          </View>
        );

      case 'repor':
        return (
          <View style={s.stepContent}>
            {(() => {
              const criticos = ATOM_KEYS.filter((k) => horta.estoqueAtomos[k] < THRESHOLDS.atomoAtencao);
              return (
                <>
                  {criticos.length > 0 ? (
                    <>
                      <Text style={s.sectionLabel}>Galões em Estado Crítico / Atenção</Text>
                      {criticos.map((key) => (
                        <GallonCard
                          key={key}
                          atomKey={key}
                          value={horta.estoqueAtomos[key]}
                          onRepor={() => handleReporGalao(key)}
                        />
                      ))}
                    </>
                  ) : (
                    <View style={s.allGoodCard}>
                      <Text style={s.allGoodText}>✓ Todos os galões estão em nível adequado!</Text>
                    </View>
                  )}
                  <Text style={[s.sectionLabel, { marginTop: 8 }]}>Todos os Galões</Text>
                  {ATOM_KEYS.map((key) => (
                    <GallonCard
                      key={key}
                      atomKey={key}
                      value={horta.estoqueAtomos[key]}
                      onRepor={() => handleReporGalao(key)}
                    />
                  ))}
                </>
              );
            })()}
          </View>
        );

      case 'sintese':
        return (
          <View style={s.stepContent}>
            {REACTIONS.map((reacao) => (
              <ReacaoCard
                key={reacao.composto}
                reacao={reacao}
                horta={horta}
                onSintetizar={(unidades) => handleSintetizar(reacao.composto, unidades)}
              />
            ))}
          </View>
        );

      case 'logs':
        return (
          <View style={s.stepContent}>
            {localLogs.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyCardText}>
                  Nenhuma ação registrada. Interaja com as etapas anteriores para gerar logs.
                </Text>
              </View>
            ) : (
              localLogs.map((entry) => {
                const isCrit = entry.nivel === 'critico';
                const isAtc = entry.nivel === 'atencao';
                const entryColor = isCrit
                  ? COLORS.critico
                  : isAtc
                  ? COLORS.atencao
                  : TIPO_COLOR[entry.tipo] ?? COLORS.textSecondary;
                return (
                  <View
                    key={entry.id}
                    style={[
                      s.logCard,
                      entry.nivel && { borderColor: entryColor + '50', backgroundColor: entryColor + '0A' },
                    ]}
                  >
                    <View style={s.logTop}>
                      <Text style={s.logEmoji}>{TIPO_EMOJI[entry.tipo] ?? '📊'}</Text>
                      <Text style={[s.logDesc, entry.nivel && { color: entryColor }]} numberOfLines={2}>
                        {entry.descricao}
                      </Text>
                      {entry.nivel && (
                        <View style={[s.nivelBadge, { borderColor: entryColor, backgroundColor: entryColor + '20' }]}>
                          <Text style={[s.nivelBadgeText, { color: entryColor }]}>
                            {isCrit ? 'CRÍTICO' : 'ATENÇÃO'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );

      case 'fim': {
        const acoes = localLogs.filter((l) => l.tipo !== 'alerta').length;
        return (
          <View style={[s.stepContent, s.fimContent]}>
            <Text style={s.fimEmoji}>🌱</Text>
            <Text style={s.fimTitulo}>Missão cumprida!</Text>
            <Text style={s.fimSub}>
              Você cobriu todas as áreas essenciais do TerraForm.
            </Text>
            <View style={s.fimCard}>
              <Text style={s.fimCardLabel}>O que você aprendeu:</Text>
              {[
                'Verificar condições do planeta',
                'Tratar o solo — pH e umidade',
                'Tratar a atmosfera — O₂ e CO₂',
                'Alimentar nutrientes do solo',
                'Visualizar o estoque completo',
                'Reabastecer galões críticos',
                'Criar sínteses de compostos',
                'Monitorar o histórico de logs',
              ].map((item, i) => (
                <View key={i} style={s.fimItem}>
                  <Text style={s.fimCheck}>✓</Text>
                  <Text style={s.fimItemText}>{item}</Text>
                </View>
              ))}
            </View>
            {acoes > 0 && (
              <Text style={s.fimStats}>
                {acoes} ação{acoes !== 1 ? 'ões' : ''} realizada{acoes !== 1 ? 's' : ''} durante o tutorial
              </Text>
            )}
          </View>
        );
      }

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <GradientBackground planetaId="marte">
      <View style={s.container}>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Tutorial Prático</Text>
            <Text style={s.headerSub}>Estufa Demo-Ares · Marte</Text>
          </View>
          <View style={s.stepBadge}>
            <Text style={s.stepBadgeText}>{current.num}/{STEPS.length}</Text>
          </View>
        </View>

        {/* TOOLTIP */}
        <View style={s.tooltip}>
          <Text style={s.tooltipTitle}>{current.titulo}</Text>
          <Text style={s.tooltipDesc}>{current.descricao}</Text>
          {current.dica && (
            <View style={s.dicaRow}>
              <Text style={s.dicaArrow}>→</Text>
              <Text style={s.dicaText}>{current.dica}</Text>
            </View>
          )}
        </View>

        {/* CONTENT */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>

        {/* FOOTER — fundo sempre visível; conteúdo some quando modal aberto */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.prevBtn, isFirst && s.prevBtnDisabled, anyModalOpen && { opacity: 0 }]}
            onPress={() => !anyModalOpen && !isFirst && setStep((p) => p - 1)}
            disabled={isFirst || anyModalOpen}
          >
            <Text style={[s.prevBtnText, isFirst && s.prevBtnTextDisabled]}>← Anterior</Text>
          </TouchableOpacity>

          <View style={[s.dotsRow, anyModalOpen && { opacity: 0 }]}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[s.dot, i === step && s.dotActive, i < step && s.dotDone]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[s.nextBtn, anyModalOpen && { opacity: 0 }]}
            onPress={() => !anyModalOpen && (isLast ? router.back() : setStep((p) => p + 1))}
            disabled={anyModalOpen}
          >
            <Text style={s.nextBtnText}>{isLast ? 'Concluir' : 'Próximo →'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODALS */}
      <PlanetaInfoSheet
        visible={planetaInfoVisible}
        planeta={TUTORIAL_PLANETA}
        onClose={() => setPlanetaInfoVisible(false)}
      />
      <SoloControleSheet
        visible={soloControleVisible}
        horta={horta}
        onAplicarComposto={(comp, _alvo, qty) => handleAplicarComposto(comp, 'solo', qty)}
        onClose={() => setSoloControleVisible(false)}
      />
      <AtmosferaSheet
        visible={atmosferaVisible}
        horta={horta}
        onAplicarH2OAr={(qty) => handleAplicarComposto('H2O', 'ar', qty)}
        onInjetarO2={(qty) => handleInjetarO2(qty)}
        onClose={() => setAtmosferaVisible(false)}
      />
      <NutrirSoloSheet
        visible={sheetNutriente !== null}
        nutriente={sheetNutriente}
        horta={horta}
        onAplicar={(atomo, qtd) => handleAplicarAtomNoSolo(atomo, qtd)}
        onClose={() => setSheetNutriente(null)}
      />
    </GradientBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: 52 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 14 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.ciano, fontSize: 14, fontWeight: 'bold' },
  headerSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 1 },
  stepBadge: {
    borderWidth: 1, borderColor: COLORS.ciano + '60', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  stepBadgeText: { color: COLORS.ciano, fontSize: 12, fontWeight: 'bold' },

  // Tooltip card
  tooltip: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: COLORS.highlight,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.ciano + '40',
  },
  tooltipTitle: { color: COLORS.text, fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  tooltipDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  dicaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  dicaArrow: { color: COLORS.ciano, fontSize: 14, fontWeight: 'bold', marginTop: 1 },
  dicaText: { color: COLORS.ciano, fontSize: 12, flex: 1, lineHeight: 17 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  stepContent: { gap: 10 },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  prevBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  prevBtnDisabled: { opacity: 0.35 },
  prevBtnText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  prevBtnTextDisabled: { color: COLORS.textDim },
  nextBtn: {
    backgroundColor: COLORS.ciano, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  nextBtnText: { color: '#000', fontSize: 13, fontWeight: 'bold' },

  // Progress dots
  dotsRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.ciano, width: 14 },
  dotDone: { backgroundColor: COLORS.ciano + '55' },

  // Alert section (intro)
  alertaBox: { borderRadius: 12, borderWidth: 1.5, padding: 12 },
  alertaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertaBadge: { width: 22, height: 22, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  alertaBadgeText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
  alertaTitleText: { fontSize: 13, fontWeight: 'bold' },
  alertaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 3 },
  alertaDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  alertaRowText: { fontSize: 12, flex: 1 },
  moreText: { color: COLORS.textDim, fontSize: 11, marginTop: 4 },

  // Info card (supporting text per step)
  infoCard: {
    backgroundColor: COLORS.cardGlass, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  infoCardTitle: {
    color: COLORS.textSecondary, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  infoCardText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 19 },

  // Nutrientes grid
  nutrientesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },

  // Section label
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },

  // All good card (repor step when all ok)
  allGoodCard: {
    backgroundColor: COLORS.verde + '18', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.verde + '50',
  },
  allGoodText: { color: COLORS.verde, fontSize: 13, textAlign: 'center' },

  // Log entries (logs step)
  logCard: {
    backgroundColor: COLORS.cardGlass, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, padding: 10,
  },
  logTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  logEmoji: { fontSize: 14, flexShrink: 0, marginTop: 1 },
  logDesc: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  nivelBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, flexShrink: 0 },
  nivelBadgeText: { fontSize: 9, fontWeight: 'bold' },

  // Empty log state
  emptyCard: {
    backgroundColor: COLORS.cardGlass, borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  emptyCardText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Fim step
  fimContent: { alignItems: 'center', paddingTop: 12 },
  fimEmoji: { fontSize: 64, marginBottom: 12 },
  fimTitulo: { color: COLORS.verde, fontSize: 26, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  fimSub: {
    color: COLORS.textSecondary, fontSize: 14, textAlign: 'center',
    marginBottom: 20, lineHeight: 20,
  },
  fimCard: {
    backgroundColor: COLORS.cardGlass, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.verde + '40', width: '100%',
  },
  fimCardLabel: {
    color: COLORS.textSecondary, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  fimItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  fimCheck: { color: COLORS.verde, fontSize: 14, fontWeight: 'bold', width: 18 },
  fimItemText: { color: COLORS.text, fontSize: 13 },
  fimStats: { color: COLORS.textDim, fontSize: 12, marginTop: 16, textAlign: 'center' },
});
