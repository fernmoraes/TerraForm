import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Horta, Planeta, LogEntry, AtomKey, CompoundKey, AplicacaoAlvo } from '../types';
import { PLANETAS, SEED_HORTAS } from '../data/seed';
import { REACTIONS } from '../data/reactions';
import { PLANT_SPECIES_DATA, FASE_LABELS } from '../data/plants';
import { calcSoloQualidade, calcArQualidade, advancePlant } from '../utils/agriculture';
import { calcGravityFactor } from '../utils/gravity';
import { applyCompostoToHorta, synthesizeComposto } from '../utils/chemistry';
import { clamp, generateId } from '../utils/formatters';
import {
  BASE_CONSUMO_NUTRIENTES, BASE_CONSUMO_UMIDADE_SOLO,
  BASE_CONSUMO_O2, BASE_PRODUCAO_CO2, BASE_CONSUMO_UMIDADE_AR,
  BASE_GP, MAX_LOGS,
} from '../constants/simulation';
import { THRESHOLDS } from '../constants/thresholds';
import type { SoloNutrienteKey } from '../types';

interface HortaState {
  planetas: Planeta[];
  hortas: Horta[];
  selectedPlanetaId: string;
  selectedHortaId: string;
  logs: LogEntry[];
  _hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  getHortaAtual: () => Horta | undefined;
  getPlanetaAtual: () => Planeta | undefined;
  getHortasByPlaneta: (planetaId: string) => Horta[];

  selectPlaneta: (id: string) => void;
  selectHorta: (id: string) => void;
  tickSimulacao: () => void;
  aplicarComposto: (hortaId: string, composto: CompoundKey, alvo: AplicacaoAlvo, quantidade: number) => void;
  sintetizarComposto: (hortaId: string, compostoKey: CompoundKey, unidades: number) => void;
  reporGalao: (hortaId: string, atomo: AtomKey) => void;
  aplicarAtomNoSolo: (hortaId: string, atomo: SoloNutrienteKey, quantidade: number) => void;
  injetarO2NoAr: (hortaId: string, quantidade: number) => void;
  resetSimulacao: () => void;
}

const NUTRIENTE_NOMES: Record<SoloNutrienteKey, string> = {
  N: 'Nitrogênio', P: 'Fósforo', K: 'Potássio', Ca: 'Cálcio', Mg: 'Magnésio', S: 'Enxofre',
};

function tickHorta(horta: Horta, planeta: Planeta): { horta: Horta; newLogs: LogEntry[] } {
  const gf = calcGravityFactor(planeta.gravidade);
  const newLogs: LogEntry[] = [];
  const now = new Date().toISOString();

  const novoNutrientes = { ...horta.solo.nutrientes };
  (Object.keys(novoNutrientes) as SoloNutrienteKey[]).forEach((key) => {
    novoNutrientes[key] = clamp(novoNutrientes[key] - BASE_CONSUMO_NUTRIENTES[key] * gf, 0, 100);
  });

  const novaUmidadeSolo = clamp(horta.solo.umidade - BASE_CONSUMO_UMIDADE_SOLO * gf, 0, 100);
  const novoO2 = clamp(horta.ar.o2 - BASE_CONSUMO_O2 * gf, 0, 30);
  const novoCo2 = clamp(horta.ar.co2 + BASE_PRODUCAO_CO2 * gf, 0, 5);
  const novaUmidadeAr = clamp(horta.ar.umidade - BASE_CONSUMO_UMIDADE_AR * gf, 0, 100);

  const novoSolo = {
    ph: horta.solo.ph,
    nutrientes: novoNutrientes,
    umidade: novaUmidadeSolo,
    qualidade: calcSoloQualidade(novoNutrientes, horta.solo.ph, novaUmidadeSolo),
  };

  const novoAr = {
    o2: novoO2,
    co2: novoCo2,
    umidade: novaUmidadeAr,
    qualidade: calcArQualidade(novoO2, novoCo2, novaUmidadeAr),
  };

  const gp = BASE_GP * (novoSolo.qualidade / 100) * (novoAr.qualidade / 100) * gf;
  const { planta: novaPlanta, advanced } = advancePlant(horta.planta, gp);

  if (advanced) {
    const nomeEspecie = PLANT_SPECIES_DATA[horta.planta.especie].nome;
    newLogs.push({
      id: generateId(), timestamp: now, planetaId: horta.planetaId, hortaId: horta.id,
      tipo: 'crescimento',
      descricao: `${nomeEspecie} avançou para: ${FASE_LABELS[novaPlanta.fase]}`,
    });
  }

  // Alertas: dispara apenas ao cruzar uma fronteira de 10% para baixo
  const cruzouFronteira = (prev: number, next: number) =>
    Math.floor(prev / 10) > Math.floor(next / 10);

  (Object.keys(novoNutrientes) as SoloNutrienteKey[]).forEach((key) => {
    const prev = horta.solo.nutrientes[key];
    const next = novoNutrientes[key];
    if (cruzouFronteira(prev, next)) {
      const marco = Math.floor(next / 10) * 10;
      const nivel: NivelAlerta = next < THRESHOLDS.nutrienteCritico ? 'critico' : 'atencao';
      newLogs.push({
        id: generateId(), timestamp: now, planetaId: horta.planetaId, hortaId: horta.id,
        tipo: 'alerta', nivel,
        descricao: `${NUTRIENTE_NOMES[key]} caiu para ${marco}% no solo`,
      });
    }
  });

  if (cruzouFronteira(horta.solo.umidade, novaUmidadeSolo)) {
    const marco = Math.floor(novaUmidadeSolo / 10) * 10;
    const nivel: NivelAlerta = novaUmidadeSolo < THRESHOLDS.umidadeSoloMin ? 'critico' : 'atencao';
    newLogs.push({
      id: generateId(), timestamp: now, planetaId: horta.planetaId, hortaId: horta.id,
      tipo: 'alerta', nivel,
      descricao: `Umidade do solo caiu para ${marco}%`,
    });
  }

  return { horta: { ...horta, solo: novoSolo, ar: novoAr, planta: novaPlanta }, newLogs };
}

export const useHortaStore = create<HortaState>()(
  persist(
    (set, get) => ({
      planetas: PLANETAS,
      hortas: SEED_HORTAS,
      selectedPlanetaId: PLANETAS[0].id,
      selectedHortaId: SEED_HORTAS[0].id,
      logs: [],
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      getHortaAtual: () => {
        const { hortas, selectedHortaId } = get();
        return hortas.find((h) => h.id === selectedHortaId);
      },
      getPlanetaAtual: () => {
        const { planetas, selectedPlanetaId } = get();
        return planetas.find((p) => p.id === selectedPlanetaId);
      },
      getHortasByPlaneta: (planetaId) =>
        get().hortas.filter((h) => h.planetaId === planetaId),

      selectPlaneta: (id) => {
        const firstHorta = get().hortas.find((h) => h.planetaId === id);
        set({ selectedPlanetaId: id, selectedHortaId: firstHorta?.id ?? '' });
      },
      selectHorta: (id) => set({ selectedHortaId: id }),

      tickSimulacao: () => {
        set((state) => {
          const allNewLogs: LogEntry[] = [];
          const updatedHortas = state.hortas.map((horta) => {
            const planeta = state.planetas.find((p) => p.id === horta.planetaId)!;
            const { horta: updated, newLogs } = tickHorta(horta, planeta);
            allNewLogs.push(...newLogs);
            return updated;
          });
          const allLogs = [...state.logs, ...allNewLogs].slice(-MAX_LOGS);
          return { hortas: updatedHortas, logs: allLogs };
        });
      },

      aplicarComposto: (hortaId, composto, alvo, quantidade) => {
        set((state) => {
          const horta = state.hortas.find((h) => h.id === hortaId);
          if (!horta) return state;
          const updated = applyCompostoToHorta(horta, composto, alvo, quantidade);
          const log: LogEntry = {
            id: generateId(), timestamp: new Date().toISOString(),
            planetaId: horta.planetaId, hortaId,
            tipo: 'aplicacao',
            descricao: `${quantidade}% de ${composto} aplicado no ${alvo === 'solo' ? 'solo' : 'ar'}`,
          };
          return {
            hortas: state.hortas.map((h) => (h.id === hortaId ? updated : h)),
            logs: [...state.logs, log].slice(-MAX_LOGS),
          };
        });
      },

      sintetizarComposto: (hortaId, compostoKey, unidades) => {
        set((state) => {
          const horta = state.hortas.find((h) => h.id === hortaId);
          const reacao = REACTIONS.find((r) => r.composto === compostoKey);
          if (!horta || !reacao) return state;
          const updated = synthesizeComposto(horta, reacao, unidades);
          const log: LogEntry = {
            id: generateId(), timestamp: new Date().toISOString(),
            planetaId: horta.planetaId, hortaId,
            tipo: 'sintese',
            descricao: `Sintetizado ${unidades * 10}% de ${reacao.nomeExibicao} (${reacao.composto})`,
          };
          return {
            hortas: state.hortas.map((h) => (h.id === hortaId ? updated : h)),
            logs: [...state.logs, log].slice(-MAX_LOGS),
          };
        });
      },

      reporGalao: (hortaId, atomo) => {
        set((state) => {
          const horta = state.hortas.find((h) => h.id === hortaId);
          if (!horta) return state;
          const log: LogEntry = {
            id: generateId(), timestamp: new Date().toISOString(),
            planetaId: horta.planetaId, hortaId,
            tipo: 'reposicao',
            descricao: `Galão de ${atomo} reposto a 100%`,
          };
          return {
            hortas: state.hortas.map((h) =>
              h.id === hortaId
                ? { ...h, estoqueAtomos: { ...h.estoqueAtomos, [atomo]: 100 } }
                : h
            ),
            logs: [...state.logs, log].slice(-MAX_LOGS),
          };
        });
      },

      aplicarAtomNoSolo: (hortaId, atomo, quantidade) => {
        set((state) => {
          const horta = state.hortas.find((h) => h.id === hortaId);
          if (!horta) return state;
          const espaco = Math.max(0, 100 - horta.solo.nutrientes[atomo]);
          if (espaco <= 0) return state;
          const disponivel = horta.estoqueAtomos[atomo];
          const real = Math.min(quantidade, disponivel, espaco);
          const novoNutrientes = {
            ...horta.solo.nutrientes,
            [atomo]: clamp(horta.solo.nutrientes[atomo] + real, 0, 100),
          };
          const novoSolo = {
            ...horta.solo,
            nutrientes: novoNutrientes,
            qualidade: calcSoloQualidade(novoNutrientes, horta.solo.ph, horta.solo.umidade),
          };
          const log: LogEntry = {
            id: generateId(), timestamp: new Date().toISOString(),
            planetaId: horta.planetaId, hortaId,
            tipo: 'aplicacao',
            descricao: `${real.toFixed(0)}% de ${atomo} aplicado no solo (+${real.toFixed(0)}% ${atomo})`,
          };
          return {
            hortas: state.hortas.map((h) =>
              h.id === hortaId
                ? { ...h, estoqueAtomos: { ...h.estoqueAtomos, [atomo]: clamp(disponivel - real, 0, 100) }, solo: novoSolo }
                : h
            ),
            logs: [...state.logs, log].slice(-MAX_LOGS),
          };
        });
      },

      injetarO2NoAr: (hortaId, quantidade) => {
        set((state) => {
          const horta = state.hortas.find((h) => h.id === hortaId);
          if (!horta) return state;
          const disponivel = horta.estoqueAtomos.O;
          const real = Math.min(quantidade, disponivel);
          if (real <= 0) return state;
          const novoAr = {
            ...horta.ar,
            o2: clamp(horta.ar.o2 + real * 0.08, 0, 30),
            qualidade: 0,
          };
          novoAr.qualidade = calcArQualidade(novoAr.o2, novoAr.co2, novoAr.umidade);
          const log: LogEntry = {
            id: generateId(), timestamp: new Date().toISOString(),
            planetaId: horta.planetaId, hortaId,
            tipo: 'aplicacao',
            descricao: `${real.toFixed(0)}% de O injetado no ar (+${(real * 0.08).toFixed(2)}% O₂)`,
          };
          return {
            hortas: state.hortas.map((h) =>
              h.id === hortaId
                ? { ...h, estoqueAtomos: { ...h.estoqueAtomos, O: clamp(disponivel - real, 0, 100) }, ar: novoAr }
                : h
            ),
            logs: [...state.logs, log].slice(-MAX_LOGS),
          };
        });
      },

      resetSimulacao: () => {
        set({
          hortas: SEED_HORTAS,
          logs: [],
          selectedPlanetaId: PLANETAS[0].id,
          selectedHortaId: SEED_HORTAS[0].id,
        });
      },
    }),
    {
      name: 'terraform-horta-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
