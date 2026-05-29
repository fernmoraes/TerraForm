import type { SoloNutrienteKey } from '../types';

export const TICK_INTERVAL_MS = 15_000; // 15 segundos por tick

export const BASE_GP = 2.0; // growth points por tick em condições ideais

export const BASE_CONSUMO_NUTRIENTES: Record<SoloNutrienteKey, number> = {
  N: 0.8,
  P: 0.5,
  K: 0.6,
  Ca: 0.3,
  Mg: 0.2,
  S: 0.2,
};

export const BASE_CONSUMO_UMIDADE_SOLO = 1.0;
export const BASE_CONSUMO_O2 = 0.1;
export const BASE_PRODUCAO_CO2 = 0.02;
export const BASE_CONSUMO_UMIDADE_AR = 0.3;

// GP necessários para avançar cada fase
export const FASE_DURACAO = {
  germinacao: 100,
  mudas: 200,
  vegetativo: 300,
  floracao: 250,
  colheita: Infinity,
} as const;

export const MAX_LOGS = 500;
