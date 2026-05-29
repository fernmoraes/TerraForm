import type { Reacao } from '../types';

export const REACTIONS: Reacao[] = [
  {
    composto: 'H2O',
    nomeExibicao: 'Água',
    equacao: '2H₂ + O₂ → 2H₂O',
    funcao: 'Irrigação do solo e controle de umidade do ar',
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
    funcao: 'Fonte direta de nitrogênio assimilável pelas plantas',
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
    funcao: 'Correção de pH ácido e fonte de cálcio',
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
    funcao: 'Acidificação do solo e regulação de pH alcalino',
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
