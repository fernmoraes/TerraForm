export type AtomKey = 'N' | 'P' | 'K' | 'Ca' | 'Mg' | 'S' | 'O' | 'H' | 'C';
export type CompoundKey = 'H2O' | 'NH3' | 'CaCO3' | 'H2CO3';
export type SoloNutrienteKey = 'N' | 'P' | 'K' | 'Ca' | 'Mg' | 'S';
export type FaseCrescimento = 'germinacao' | 'mudas' | 'vegetativo' | 'floracao' | 'colheita';
export type EspeciePlanta = 'alface' | 'batata' | 'tomate' | 'trigo' | 'cenoura' | 'soja';
export type TipoLog = 'aplicacao' | 'sintese' | 'reposicao' | 'alerta' | 'crescimento' | 'leitura';
export type NivelAlerta = 'atencao' | 'critico';
export type AplicacaoAlvo = 'solo' | 'ar';

export type AtomStocks = Record<AtomKey, number>;
export type CompoundStocks = Record<CompoundKey, number>;
export type SoloNutrientes = Record<SoloNutrienteKey, number>;

export type Planeta = {
  id: string;
  nome: string;
  gravidade: number;
  cor: string;
};

export type Planta = {
  especie: EspeciePlanta;
  fase: FaseCrescimento;
  progressoFase: number; // 0–100 dentro da fase atual
};

export type Solo = {
  ph: number;                 // 0–14 (ideal 6.0–7.0)
  qualidade: number;          // 0–100 derivado
  nutrientes: SoloNutrientes; // 0–100%
  umidade: number;            // 0–100%
};

export type Ar = {
  qualidade: number; // 0–100 derivado
  o2: number;        // % real (ideal 19–22)
  co2: number;       // % real (ideal 0.03–0.08)
  umidade: number;   // 0–100%
};

export type Horta = {
  id: string;
  nome: string;
  planetaId: string;
  planta: Planta;
  solo: Solo;
  ar: Ar;
  estoqueAtomos: AtomStocks;
  estoqueCompostos: CompoundStocks;
};

export type LogEntry = {
  id: string;
  timestamp: string;
  planetaId: string;
  hortaId: string;
  tipo: TipoLog;
  descricao: string;
  nivel?: NivelAlerta;
};

export type Reagente = {
  tipo: 'atomo' | 'composto';
  chave: AtomKey | CompoundKey;
  custoPor10: number;
};

export type Reacao = {
  composto: CompoundKey;
  nomeExibicao: string;
  equacao: string;
  funcao: string;
  reagentes: Reagente[];
  alvosDisponiveis: AplicacaoAlvo[];
};

export type EspecieData = {
  especie: EspeciePlanta;
  nome: string;
  nomecientifico: string;
  cor: string;
  emoji: string;
  image: number;
};
