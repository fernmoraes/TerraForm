import type { Planta, Solo, SoloNutrientes, FaseCrescimento } from '../types';
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
  if (v >= 20 && v < 40) return ramp(v, 0, 40);
  if (v > 80 && v <= 100) return 1 - ramp(v, 80, 110) * 0.3;
  return clamp(v / 20, 0, 1);
}

function phScore(ph: number): number {
  if (ph >= 6.0 && ph <= 7.0) return 1;
  if (ph >= 5.5 && ph < 6.0) return ramp(ph, 4.5, 6.0);
  if (ph > 7.0 && ph <= 7.5) return 1 - ramp(ph, 7.0, 8.5);
  return clamp(1 - Math.abs(ph - 6.5) / 3, 0, 1);
}

function umidadeScore(umidade: number): number {
  if (umidade >= 35 && umidade <= 65) return 1;
  if (umidade < 35) return ramp(umidade, 5, 35);
  return 1 - ramp(umidade, 65, 95);
}

export function calcSoloQualidade(
  nutrientes: SoloNutrientes,
  ph: number,
  umidade: number
): number {
  const nutriValues = Object.values(nutrientes);
  const nutriMedia = nutriValues.reduce((acc, v) => acc + nutrienteScore(v), 0) / nutriValues.length;
  const score = nutriMedia * 0.6 + phScore(ph) * 0.2 + umidadeScore(umidade) * 0.2;
  return clamp(Math.round(score * 100), 0, 100);
}

export function calcArQualidade(o2: number, co2: number, umidade: number): number {
  const o2Score = (() => {
    if (o2 >= 19 && o2 <= 22) return 1;
    if (o2 < 19) return ramp(o2, 14, 19);
    return 1 - ramp(o2, 22, 30);
  })();

  const co2Score = (() => {
    if (co2 <= 0.08) return 1;
    if (co2 <= 2.0) return 1 - ramp(co2, 0.08, 2.0);
    return 0;
  })();

  const humScore = umidadeScore(umidade);

  const score = o2Score * 0.4 + co2Score * 0.4 + humScore * 0.2;
  return clamp(Math.round(score * 100), 0, 100);
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
