export const THRESHOLDS = {
  // Estoque de átomos (0-100%)
  atomoAtencao: 25,
  atomoCritico: 10,

  // Estoque de compostos (0-100%)
  compostoAtencao: 20,
  compostoCritico: 10,

  // Nutrientes do solo (0-100%)
  nutrienteAtencao: 25,
  nutrienteCritico: 15,

  // Umidade do solo (0-100%)
  umidadeSoloMin: 15,
  umidadeSoloAtencao: 25,
  umidadeSoloMaxAtencao: 80,

  // pH do solo (0-14)
  phMinCritico: 5.0,
  phMinAtencao: 5.5,
  phMaxAtencao: 7.5,
  phMaxCritico: 8.0,

  // O2 no ar (% real)
  o2MinCritico: 16,
  o2MinAtencao: 18,
  o2MaxAtencao: 26,

  // CO2 no ar (% real)
  co2MaxAtencao: 0.5,
  co2MaxCritico: 1.5,

  // Umidade do ar (0-100%)
  umidadeArMinCritico: 20,
  umidadeArMinAtencao: 30,
  umidadeArMaxAtencao: 85,
} as const;
