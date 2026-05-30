import type { Horta, Planeta, LogEntry } from '../types';
import { calcSoloQualidade, calcArQualidade } from '../utils/agriculture';
import { generateId } from '../utils/formatters';

export const TUTORIAL_PLANETA: Planeta = {
  id: 'marte',
  nome: 'Marte',
  gravidade: 0.38,
  cor: '#C1440E',
};

const _n = { N: 12, P: 8, K: 45, Ca: 35, Mg: 22, S: 18 };
const _ph = 8.2;
const _umS = 15;
const _o2 = 15.5;
const _co2 = 0.15;
const _umA = 20;

export const TUTORIAL_HORTA_INICIAL: Horta = {
  id: 'tutorial-demo',
  nome: 'Estufa Demo-Ares',
  planetaId: 'marte',
  planta: { especie: 'tomate', fase: 'vegetativo', progressoFase: 30 },
  solo: {
    ph: _ph,
    nutrientes: _n,
    umidade: _umS,
    qualidade: calcSoloQualidade(_n, _ph, _umS),
  },
  ar: {
    o2: _o2,
    co2: _co2,
    umidade: _umA,
    qualidade: calcArQualidade(_o2, _co2, _umA),
  },
  estoqueAtomos: { N: 50, P: 70, K: 60, Ca: 55, Mg: 48, S: 50, O: 70, H: 45, C: 40 },
  estoqueCompostos: { H2O: 100, NH3: 5, CaCO3: 30, H2CO3: 50 },
};

const _ts = new Date().toISOString();

export const TUTORIAL_INITIAL_LOGS: LogEntry[] = [
  { id: generateId(), timestamp: _ts, planetaId: 'marte', hortaId: 'tutorial-demo', tipo: 'alerta', nivel: 'critico', descricao: 'O₂ crítico — 15.5% (ideal 19–22%)' },
  { id: generateId(), timestamp: _ts, planetaId: 'marte', hortaId: 'tutorial-demo', tipo: 'alerta', nivel: 'critico', descricao: 'pH do solo crítico — 8.2 (ideal 6.0–7.0)' },
  { id: generateId(), timestamp: _ts, planetaId: 'marte', hortaId: 'tutorial-demo', tipo: 'alerta', nivel: 'critico', descricao: 'Nitrogênio crítico no solo — 12%' },
  { id: generateId(), timestamp: _ts, planetaId: 'marte', hortaId: 'tutorial-demo', tipo: 'alerta', nivel: 'critico', descricao: 'Fósforo crítico no solo — 8%' },
  { id: generateId(), timestamp: _ts, planetaId: 'marte', hortaId: 'tutorial-demo', tipo: 'alerta', nivel: 'critico', descricao: 'Umidade do solo crítica — 15%' },
];
