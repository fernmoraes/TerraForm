import type { Reacao } from '../types';

export const REACTIONS: Reacao[] = [
  {
    composto: 'H2O',
    nomeExibicao: 'Água',
    equacao: '2H₂ + O₂ → 2H₂O',
    funcao: 'Irrigação e umidade. Use no solo quando umidade < 30% ou no ar quando umidade < 40%.',
    reagentes: [
      { tipo: 'atomo', chave: 'H', custoPor10: 8 },
      { tipo: 'atomo', chave: 'O', custoPor10: 4 },
    ],
    alvosDisponiveis: ['solo', 'ar'],
  },
  {
    composto: 'NH3',
    nomeExibicao: 'Amônia',
    equacao: 'N₂ + 3H₂ → 2NH₃',
    funcao: 'Nitrogênio direto ao solo. Estimula crescimento foliar. Use quando N < 25%.',
    reagentes: [
      { tipo: 'atomo', chave: 'N', custoPor10: 4 },
      { tipo: 'atomo', chave: 'H', custoPor10: 12 },
    ],
    alvosDisponiveis: ['solo'],
  },
  {
    composto: 'CaCO3',
    nomeExibicao: 'Carbonato de Cálcio',
    equacao: 'Ca + CO₂ + ½O₂ → CaCO₃',
    funcao: 'Eleva pH ácido e fornece cálcio às células. Use quando pH < 6.0 ou Ca < 25%.',
    reagentes: [
      { tipo: 'atomo', chave: 'Ca', custoPor10: 5 },
      { tipo: 'atomo', chave: 'C', custoPor10: 5 },
      { tipo: 'atomo', chave: 'O', custoPor10: 8 },
    ],
    alvosDisponiveis: ['solo'],
  },
  {
    composto: 'H2CO3',
    nomeExibicao: 'Ácido Carbônico',
    equacao: 'CO₂ + H₂O → H₂CO₃',
    funcao: 'Reduz pH alcalino. Use quando pH > 7.5. Atenção: consome H₂O do estoque.',
    reagentes: [
      { tipo: 'atomo', chave: 'C', custoPor10: 4 },
      { tipo: 'atomo', chave: 'O', custoPor10: 6 },
      { tipo: 'composto', chave: 'H2O', custoPor10: 6 },
    ],
    alvosDisponiveis: ['solo'],
  },
];

export const REACTION_MAP = Object.fromEntries(
  REACTIONS.map(r => [r.composto, r])
) as Record<string, Reacao>;
