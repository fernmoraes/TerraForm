import type { EspecieData, EspeciePlanta, FaseCrescimento } from '../types';

export const PLANT_SPECIES_DATA: Record<EspeciePlanta, EspecieData> = {
  alface: { especie: 'alface', nome: 'Alface', nomecientifico: 'Lactuca sativa', cor: '#39FF14', emoji: '🥬' },
  batata: { especie: 'batata', nome: 'Batata', nomecientifico: 'Solanum tuberosum', cor: '#D4A017', emoji: '🥔' },
  tomate: { especie: 'tomate', nome: 'Tomate', nomecientifico: 'Solanum lycopersicum', cor: '#FF6B35', emoji: '🍅' },
  trigo: { especie: 'trigo', nome: 'Trigo', nomecientifico: 'Triticum aestivum', cor: '#FFD700', emoji: '🌾' },
  cenoura: { especie: 'cenoura', nome: 'Cenoura', nomecientifico: 'Daucus carota', cor: '#FF8C00', emoji: '🥕' },
  soja: { especie: 'soja', nome: 'Soja', nomecientifico: 'Glycine max', cor: '#90EE90', emoji: '🌿' },
};

export const FASE_LABELS: Record<FaseCrescimento, string> = {
  germinacao: 'Germinação',
  mudas: 'Mudas',
  vegetativo: 'Vegetativo',
  floracao: 'Floração',
  colheita: 'Colheita',
};

export const FASES_ORDEM: FaseCrescimento[] = [
  'germinacao', 'mudas', 'vegetativo', 'floracao', 'colheita',
];
