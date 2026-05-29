import type { Horta, CompoundKey, AplicacaoAlvo, Reacao } from '../types';
import { calcSoloQualidade, calcArQualidade } from './agriculture';
import { clamp } from './formatters';

type Efeito = { campo: string; delta: number };

const EFEITOS_POR_10: Record<CompoundKey, Partial<Record<AplicacaoAlvo, Efeito[]>>> = {
  H2O: {
    solo: [
      { campo: 'umidade', delta: 12 },
    ],
    ar: [
      { campo: 'umidade', delta: 6 },
      { campo: 'co2', delta: -0.05 }, // CO₂ + H₂O → H₂CO₃ (absorção de CO₂ pela água)
    ],
  },
  NH3: {
    solo: [
      { campo: 'N', delta: 15 },
      { campo: 'ph', delta: 0.2 },
    ],
  },
  CaCO3: {
    solo: [
      { campo: 'Ca', delta: 12 },
      { campo: 'ph', delta: 0.3 },
    ],
  },
  H2CO3: {
    solo: [
      { campo: 'ph', delta: -0.4 },
      { campo: 'umidade', delta: 4 },
    ],
  },
};

export function applyCompostoToHorta(
  horta: Horta,
  composto: CompoundKey,
  alvo: AplicacaoAlvo,
  quantidade: number // porcentagem a aplicar (10, 20, ...)
): Horta {
  const estoqueAtual = horta.estoqueCompostos[composto];
  const realQtd = Math.min(quantidade, estoqueAtual);
  const multiplier = realQtd / 10;

  const efeitos = EFEITOS_POR_10[composto]?.[alvo] ?? [];

  let novoSolo = { ...horta.solo, nutrientes: { ...horta.solo.nutrientes } };
  let novoAr = { ...horta.ar };

  efeitos.forEach(({ campo, delta }) => {
    const totalDelta = delta * multiplier;
    if (alvo === 'solo') {
      if (campo === 'ph') {
        novoSolo.ph = clamp(novoSolo.ph + totalDelta, 0, 14);
      } else if (campo === 'umidade') {
        novoSolo.umidade = clamp(novoSolo.umidade + totalDelta, 0, 100);
      } else if (campo in novoSolo.nutrientes) {
        const key = campo as keyof typeof novoSolo.nutrientes;
        novoSolo.nutrientes[key] = clamp(novoSolo.nutrientes[key] + totalDelta, 0, 100);
      }
    } else {
      if (campo === 'umidade') {
        novoAr.umidade = clamp(novoAr.umidade + totalDelta, 0, 100);
      } else if (campo === 'o2') {
        novoAr.o2 = clamp(novoAr.o2 + totalDelta, 0, 30);
      } else if (campo === 'co2') {
        novoAr.co2 = clamp(novoAr.co2 + totalDelta, 0, 5);
      }
    }
  });

  novoSolo.qualidade = calcSoloQualidade(novoSolo.nutrientes, novoSolo.ph, novoSolo.umidade);
  novoAr.qualidade = calcArQualidade(novoAr.o2, novoAr.co2, novoAr.umidade);

  return {
    ...horta,
    solo: novoSolo,
    ar: novoAr,
    estoqueCompostos: {
      ...horta.estoqueCompostos,
      [composto]: clamp(estoqueAtual - realQtd, 0, 100),
    },
  };
}

export function calcMaxUnidades(horta: Horta, reacao: Reacao): number {
  let maxUnidades = 20;
  for (const reagente of reacao.reagentes) {
    const disponivel =
      reagente.tipo === 'atomo'
        ? horta.estoqueAtomos[reagente.chave as keyof typeof horta.estoqueAtomos]
        : horta.estoqueCompostos[reagente.chave as keyof typeof horta.estoqueCompostos];
    const maxPorEste = Math.floor(disponivel / reagente.custoPor10);
    if (maxPorEste < maxUnidades) maxUnidades = maxPorEste;
  }
  return Math.max(0, maxUnidades);
}

export function synthesizeComposto(horta: Horta, reacao: Reacao, unidades: number): Horta {
  let novosAtomos = { ...horta.estoqueAtomos };
  let novosCompostos = { ...horta.estoqueCompostos };

  for (const reagente of reacao.reagentes) {
    const custo = reagente.custoPor10 * unidades;
    if (reagente.tipo === 'atomo') {
      const key = reagente.chave as keyof typeof novosAtomos;
      novosAtomos[key] = clamp(novosAtomos[key] - custo, 0, 100);
    } else {
      const key = reagente.chave as keyof typeof novosCompostos;
      novosCompostos[key] = clamp(novosCompostos[key] - custo, 0, 100);
    }
  }

  const produzido = unidades * 10;
  novosCompostos[reacao.composto] = clamp(
    novosCompostos[reacao.composto] + produzido,
    0,
    100
  );

  return { ...horta, estoqueAtomos: novosAtomos, estoqueCompostos: novosCompostos };
}
