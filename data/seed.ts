import type { Planeta, Horta } from '../types';
import { calcSoloQualidade, calcArQualidade } from '../utils/agriculture';

export const PLANETAS: Planeta[] = [
  { id: 'lua',    nome: 'Lua',    gravidade: 0.17, cor: '#A0A0A8' },
  { id: 'marte',  nome: 'Marte',  gravidade: 0.38, cor: '#C1440E' },
  { id: 'europa', nome: 'Europa', gravidade: 0.13, cor: '#4488CC' },
  { id: 'tita',   nome: 'Titã',   gravidade: 0.14, cor: '#D4A017' },
  { id: 'terra',  nome: 'Terra',  gravidade: 1.00, cor: '#2E8B57' },
];

export const PLANET_IMAGES: Record<string, number> = {
  lua:    require('../assets/planets/lua.png'),
  marte:  require('../assets/planets/marte.png'),
  europa: require('../assets/planets/europa.png'),
  tita:   require('../assets/planets/tita.png'),
  terra:  require('../assets/planets/terra.png'),
};

function makeHorta(partial: Omit<Horta, 'solo' | 'ar'> & {
  solo: Omit<Horta['solo'], 'qualidade'>;
  ar: Omit<Horta['ar'], 'qualidade'>;
}): Horta {
  const { solo, ar, ...rest } = partial;
  return {
    ...rest,
    solo: {
      ...solo,
      qualidade: calcSoloQualidade(solo.nutrientes, solo.ph, solo.umidade),
    },
    ar: {
      ...ar,
      qualidade: calcArQualidade(ar.o2, ar.co2, ar.umidade),
    },
  };
}

export const SEED_HORTAS: Horta[] = [
  // LUA
  makeHorta({
    id: 'lua-01', nome: 'Estufa Selene-01', planetaId: 'lua',
    planta: { especie: 'alface', fase: 'vegetativo', progressoFase: 45 },
    solo: { ph: 6.5, nutrientes: { N: 75, P: 65, K: 70, Ca: 60, Mg: 55, S: 58 }, umidade: 55 },
    ar: { o2: 21.0, co2: 0.04, umidade: 62 },
    estoqueAtomos: { N: 80, P: 75, K: 72, Ca: 68, Mg: 60, S: 62, O: 78, H: 72, C: 65 },
    estoqueCompostos: { H2O: 60, NH3: 40, CaCO3: 35, H2CO3: 25 },
  }),
  makeHorta({
    id: 'lua-02', nome: 'Estufa Selene-02', planetaId: 'lua',
    planta: { especie: 'batata', fase: 'mudas', progressoFase: 80 },
    solo: { ph: 6.3, nutrientes: { N: 22, P: 68, K: 65, Ca: 55, Mg: 50, S: 52 }, umidade: 52 },
    ar: { o2: 20.5, co2: 0.05, umidade: 58 },
    estoqueAtomos: { N: 18, P: 70, K: 65, Ca: 60, Mg: 55, S: 57, O: 72, H: 68, C: 60 },
    estoqueCompostos: { H2O: 45, NH3: 8, CaCO3: 30, H2CO3: 20 },
  }),
  // MARTE
  makeHorta({
    id: 'marte-01', nome: 'Estufa Ares-01', planetaId: 'marte',
    planta: { especie: 'tomate', fase: 'floracao', progressoFase: 30 },
    solo: { ph: 6.7, nutrientes: { N: 78, P: 72, K: 75, Ca: 65, Mg: 60, S: 62 }, umidade: 58 },
    ar: { o2: 21.2, co2: 0.04, umidade: 65 },
    estoqueAtomos: { N: 85, P: 82, K: 78, Ca: 75, Mg: 70, S: 72, O: 85, H: 80, C: 72 },
    estoqueCompostos: { H2O: 70, NH3: 55, CaCO3: 45, H2CO3: 35 },
  }),
  makeHorta({
    id: 'marte-02', nome: 'Estufa Ares-02', planetaId: 'marte',
    planta: { especie: 'trigo', fase: 'germinacao', progressoFase: 20 },
    solo: { ph: 7.9, nutrientes: { N: 60, P: 58, K: 62, Ca: 55, Mg: 50, S: 48 }, umidade: 50 },
    ar: { o2: 20.8, co2: 0.06, umidade: 55 },
    estoqueAtomos: { N: 65, P: 62, K: 68, Ca: 58, Mg: 52, S: 54, O: 70, H: 65, C: 58 },
    estoqueCompostos: { H2O: 50, NH3: 30, CaCO3: 20, H2CO3: 5 },
  }),
  // EUROPA
  makeHorta({
    id: 'europa-01', nome: 'Estufa Callisto-01', planetaId: 'europa',
    planta: { especie: 'soja', fase: 'vegetativo', progressoFase: 120 },
    solo: { ph: 6.4, nutrientes: { N: 55, P: 11, K: 60, Ca: 52, Mg: 48, S: 50 }, umidade: 48 },
    ar: { o2: 20.9, co2: 0.04, umidade: 60 },
    estoqueAtomos: { N: 70, P: 8, K: 65, Ca: 60, Mg: 55, S: 58, O: 75, H: 70, C: 62 },
    estoqueCompostos: { H2O: 55, NH3: 35, CaCO3: 28, H2CO3: 20 },
  }),
  // TITÃ
  makeHorta({
    id: 'tita-01', nome: 'Estufa Titã-01', planetaId: 'tita',
    planta: { especie: 'cenoura', fase: 'mudas', progressoFase: 60 },
    solo: { ph: 6.6, nutrientes: { N: 72, P: 68, K: 70, Ca: 62, Mg: 58, S: 60 }, umidade: 53 },
    ar: { o2: 21.1, co2: 0.04, umidade: 63 },
    estoqueAtomos: { N: 78, P: 74, K: 70, Ca: 66, Mg: 62, S: 64, O: 80, H: 74, C: 68 },
    estoqueCompostos: { H2O: 62, NH3: 42, CaCO3: 38, H2CO3: 28 },
  }),
  // TERRA
  makeHorta({
    id: 'terra-01', nome: 'Estufa Terra-01', planetaId: 'terra',
    planta: { especie: 'alface', fase: 'colheita', progressoFase: 100 },
    solo: { ph: 6.8, nutrientes: { N: 82, P: 78, K: 80, Ca: 72, Mg: 68, S: 70 }, umidade: 60 },
    ar: { o2: 21.3, co2: 0.03, umidade: 66 },
    estoqueAtomos: { N: 88, P: 85, K: 82, Ca: 78, Mg: 74, S: 76, O: 88, H: 84, C: 78 },
    estoqueCompostos: { H2O: 75, NH3: 60, CaCO3: 50, H2CO3: 40 },
  }),
  makeHorta({
    id: 'terra-02', nome: 'Estufa Terra-02', planetaId: 'terra',
    planta: { especie: 'tomate', fase: 'vegetativo', progressoFase: 80 },
    solo: { ph: 6.5, nutrientes: { N: 70, P: 65, K: 68, Ca: 60, Mg: 55, S: 57 }, umidade: 18 },
    ar: { o2: 21.0, co2: 0.04, umidade: 28 },
    estoqueAtomos: { N: 75, P: 70, K: 68, Ca: 64, Mg: 58, S: 60, O: 78, H: 42, C: 65 },
    estoqueCompostos: { H2O: 5, NH3: 38, CaCO3: 32, H2CO3: 22 },
  }),
];
