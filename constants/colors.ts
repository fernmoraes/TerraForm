import type { AtomKey, CompoundKey, SoloNutrienteKey } from '../types';

export const COLORS = {
  background: '#050A1A',
  card: '#0F2044',
  highlight: '#1A3A6B',
  border: '#1E4080',

  cardGlass: 'rgba(15, 32, 68, 0.45)',
  highlightGlass: 'rgba(26, 58, 107, 0.50)',
  borderGlass: 'rgba(255, 255, 255, 0.13)',

  ciano: '#00D4FF',
  verde: '#39FF14',
  roxo: '#7B2FBE',
  laranja: '#FF6B35',
  dourado: '#FFD700',
  vermelho: '#FF4757',

  text: '#FFFFFF',
  textSecondary: '#A4B8D4',
  textDim: '#6B87A8',

  atencao: '#FFD700',
  critico: '#FF4757',
  sucesso: '#39FF14',
} as const;

export const ATOM_COLORS: Record<AtomKey, string> = {
  N: '#39FF14',
  P: '#FF6B35',
  K: '#FFD700',
  Ca: '#00D4FF',
  Mg: '#BF5FFF',
  S: '#FF4757',
  O: '#00D4FF',
  H: '#7B2FBE',
  C: '#8BA0C0',
};

export const COMPOUND_COLORS: Record<CompoundKey, string> = {
  H2O: '#00D4FF',
  NH3: '#39FF14',
  CaCO3: '#FFD700',
  H2CO3: '#FF6B35',
};

export const NUTRIENT_COLORS: Record<SoloNutrienteKey, string> = {
  N: '#39FF14',
  P: '#FF6B35',
  K: '#FFD700',
  Ca: '#00D4FF',
  Mg: '#BF5FFF',
  S: '#FF4757',
};
