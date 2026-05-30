import type { Planta, SoloNutrientes, FaseCrescimento } from '../types';
import { FASE_DURACAO } from '../constants/simulation';
import { FASES_ORDEM } from '../data/plants';
import { clamp } from './formatters';

function ramp(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 1;
  return (value - low) / (high - low);
}

function nutrienteScore(v: number): number {
  if (v >= 40 && v <= 80) return 1;
  if (v <= 15) return 0;                                // crítico → zero
  if (v < 25) return ramp(v, 15, 25) * 0.25;
  if (v < 40) return 0.25 + ramp(v, 25, 40) * 0.75;
  return 1 - ramp(v, 80, 100) * 0.15;                  // leve excesso
}

function phScore(ph: number): number {
  if (ph >= 6.0 && ph <= 7.0) return 1;
  if (ph <= 5.0 || ph >= 8.0) return 0;                // crítico → zero
  if (ph < 5.5) return ramp(ph, 5.0, 5.5) * 0.3;
  if (ph < 6.0) return 0.3 + ramp(ph, 5.5, 6.0) * 0.7;
  if (ph <= 7.5) return 1 - ramp(ph, 7.0, 7.5) * 0.7;
  return 0.3 - ramp(ph, 7.5, 8.0) * 0.3;
}

// Ideal alargado para 40-85%: estufa controlada pode operar com alta umidade.
// Acima de 85% há leve penalidade (encharcamento), mas não é crítico.
function umidadeScore(umidade: number): number {
  if (umidade >= 40 && umidade <= 85) return 1;
  if (umidade <= 15) return 0;                          // crítico → zero
  if (umidade < 25) return ramp(umidade, 15, 25) * 0.25;
  if (umidade < 40) return 0.25 + ramp(umidade, 25, 40) * 0.75;
  // 85-100%: penalidade suave (encharcamento leve)
  return 1 - ramp(umidade, 85, 100) * 0.5;
}

export function calcSoloQualidade(
  nutrientes: SoloNutrientes,
  ph: number,
  umidade: number
): number {
  const nutriScores = Object.values(nutrientes).map(nutrienteScore);
  const nutriMin = Math.min(...nutriScores);
  const nutriAvg = nutriScores.reduce((a, b) => a + b, 0) / nutriScores.length;

  const ph_s = phScore(ph);
  const um_s = umidadeScore(umidade);

  // Média ponderada: nutrientes 50%, pH 20%, umidade 30%
  const avg = nutriAvg * 0.5 + ph_s * 0.2 + um_s * 0.3;

  // Elo mais fraco: 55% vem do fator mais crítico, 45% da média
  const worst = Math.min(nutriMin, ph_s, um_s);
  return clamp(Math.round((avg * 0.45 + worst * 0.55) * 100), 0, 100);
}

export function calcArQualidade(o2: number, co2: number, umidade: number): number {
  const o2_s = (() => {
    if (o2 >= 19 && o2 <= 22) return 1;
    if (o2 <= 16) return 0;                            // crítico → zero
    if (o2 < 18) return ramp(o2, 16, 18) * 0.25;
    if (o2 < 19) return 0.25 + ramp(o2, 18, 19) * 0.75;
    if (o2 <= 26) return 1 - ramp(o2, 22, 26) * 0.7;
    return clamp(0.3 - ramp(o2, 26, 30) * 0.3, 0, 1);
  })();

  const co2_s = (() => {
    if (co2 <= 0.08) return 1;
    if (co2 >= 1.5) return 0;                          // crítico → zero
    if (co2 <= 0.5) return 1 - ramp(co2, 0.08, 0.5) * 0.5;
    return 0.5 - ramp(co2, 0.5, 1.5) * 0.5;
  })();

  const hum_s = umidadeScore(umidade);

  const avg = o2_s * 0.45 + co2_s * 0.35 + hum_s * 0.2;
  const worst = Math.min(o2_s, co2_s, hum_s);
  return clamp(Math.round((avg * 0.45 + worst * 0.55) * 100), 0, 100);
}

type AdvanceResult = { planta: Planta; advanced: boolean };

export function advancePlant(planta: Planta, gp: number): AdvanceResult {
  if (planta.fase === 'colheita') return { planta, advanced: false };

  const novoProgresso = planta.progressoFase + gp;
  const duracao = FASE_DURACAO[planta.fase];

  if (novoProgresso >= duracao) {
    const idx = FASES_ORDEM.indexOf(planta.fase);
    const nextFase: FaseCrescimento = FASES_ORDEM[idx + 1] ?? 'colheita';
    return { planta: { ...planta, fase: nextFase, progressoFase: 0 }, advanced: true };
  }

  return { planta: { ...planta, progressoFase: novoProgresso }, advanced: false };
}

export function fasePorcentagem(planta: Planta): number {
  if (planta.fase === 'colheita') return 100;
  const duracao = FASE_DURACAO[planta.fase];
  return clamp((planta.progressoFase / duracao) * 100, 0, 100);
}

export function soloStatus(qualidade: number): 'otimo' | 'atencao' | 'critico' {
  if (qualidade >= 65) return 'otimo';
  if (qualidade >= 35) return 'atencao';
  return 'critico';
}
