# TerraForm

**Gerenciamento de hortas espaciais — painel de controle para estufas herméticas no sistema solar.**

Projeto acadêmico individual — FIAP Global Solution 1, em parceria conceitual com a NASA.

---

## O Problema

Cultivar alimentos no espaço é extremamente complexo:

- Ausência de ciclos hídricos naturais
- Atmosferas hostis (sem N₂/O₂ adequados)
- Gravidade variável afeta a fisiologia das plantas e a distribuição de fluidos
- Distância torna intervenção manual impossível

---

## A Solução

TerraForm centraliza o controle operacional de estufas hermeticamente isoladas instaladas em diferentes planetas e luas do sistema solar. O usuário assume o papel de um operador agrícola que monitora e gerencia cada estufa a partir de um único aplicativo mobile.

**Não é um jogo.** TerraForm é uma ferramenta operacional — pense em um painel SCADA — com interface científica séria.

---

## Funcionalidades

- **Dashboard da Estufa** — estado em tempo real: solo, ar, atmosfera, nutrientes, fase de crescimento
- **Alertas visuais** — seção de alertas ativos no topo da estufa, com classificação crítico / atenção
- **Nutrir Tudo** — modal de aplicação em lote de nutrientes ao solo (seleção individual + validação de estoque)
- **Controle do Solo** — modal com irrigação por H₂O e correção de pH (CaCO₃, NH₃, H₂CO₃)
- **Controle da Atmosfera** — modal com absorção de CO₂, injeção de O₂ e vaporização de umidade
- **Gestão de Estoque** — 9 elementos brutos em galões + 4 compostos sintetizados
- **Síntese Química** — produzir H₂O, NH₃, CaCO₃ e H₂CO₃ com equações balanceadas e stepper
- **Logs Completos** — histórico agrupado por estufa, com filtros por horta / planeta / global e expand/collapse
- **Simulação em tempo real** — consumo automático de nutrientes a cada 15 s (foreground)
- **5 Planetas** — Lua, Marte, Europa, Titã e Terra, com gravidade influenciando as taxas de consumo
- **Tutorial de Onboarding** — 5 slides na primeira abertura; modo revisão + reset via botão "?" no header

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo ~56 |
| Linguagem | TypeScript (strict) |
| Navegação | expo-router v4 (file-based) |
| Estado global | Zustand + `persist` middleware |
| Persistência | AsyncStorage (local, sem backend) |
| Gauges SVG | react-native-svg |
| Gradientes | expo-linear-gradient |
| Ícones | @expo/vector-icons (Ionicons) |
| Notificações push | expo-notifications (pendente) |
| Feedback tátil | expo-haptics (pendente) |

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Expo Go instalado no device (iOS ou Android)

### Passos

```bash
# 1. Instale as dependências
cd TerraForm
npm install

# 2. Inicie o servidor de desenvolvimento
npx expo start

# 3. Escaneie o QR code com o Expo Go no dispositivo
```

> O app roda no **Expo Go** sem necessidade de `expo prebuild`.

---

## Estrutura de Pastas

```
TerraForm/
├── app/
│   ├── _layout.tsx           # Root layout — instancia useSimulation()
│   ├── index.tsx             # Redirect: aguarda hydration → (auth) ou (tabs)
│   ├── (auth)/
│   │   └── index.tsx         # Tutorial 5 slides (primeiro-uso + revisão)
│   └── (tabs)/
│       ├── _layout.tsx       # Tab bar + HeaderSelector + botão "?"
│       ├── estufa.tsx        # Dashboard da estufa
│       ├── estoque.tsx       # Galões e compostos
│       ├── sintese.tsx       # Síntese química
│       └── logs.tsx          # Histórico de eventos
│
├── components/
│   ├── ui/                   # GaugeCircular, ProgressBar, StatusBadge,
│   │                         #   GradientBackground, NivelIndicator, CustomAlert
│   ├── horta/                # GravityIndicator, PlantVisualization,
│   │                         #   NutrienteCard, SoloQualidadeCard, ArQualidadeCard
│   ├── estoque/              # GallonCard, CompostoCard
│   ├── sintese/              # ReacaoCard
│   ├── logs/                 # LogEntryItem
│   └── layout/               # HeaderSelector, NutrirSoloSheet,
│                             #   AtmosferaSheet, SoloControleSheet
│
├── store/
│   ├── hortaStore.ts         # Estado principal — hortas, logs, simulação
│   └── appStore.ts           # Tutorial completed / reset
│
├── data/
│   ├── seed.ts               # 5 planetas + 8 hortas + PLANET_IMAGES
│   ├── reactions.ts          # 4 reações + REACTION_MAP
│   └── plants.ts             # 6 espécies + FASE_LABELS + FASES_ORDEM
│
├── types/
│   └── index.ts              # Todos os tipos TypeScript
│
├── constants/
│   ├── colors.ts             # COLORS, ATOM_COLORS, COMPOUND_COLORS, NUTRIENT_COLORS
│   ├── thresholds.ts         # Limites de atenção e crítico
│   └── simulation.ts        # TICK_INTERVAL_MS, taxas de consumo, FASE_DURACAO, MAX_LOGS
│
├── hooks/
│   ├── useSimulation.ts      # setInterval 15s (só quando AppState === 'active')
│   └── useCustomAlert.ts     # Hook para CustomAlert nos modais
│
├── utils/
│   ├── chemistry.ts          # applyCompostoToHorta, synthesizeComposto, calcMaxUnidades
│   ├── agriculture.ts        # calcSoloQualidade, calcArQualidade, advancePlant, fasePorcentagem
│   ├── gravity.ts            # calcGravityFactor
│   └── formatters.ts         # clamp, generateId, formatTimestampRelativo
│
└── assets/
    ├── planets/              # lua.png, marte.png, europa.png, tita.png, terra.png
    └── crops/                # alface.png, batata.png, tomate.png, trigo.png, cenoura.png, soja.png
```

---

## Premissas Científicas

- As estufas são **hermeticamente isoladas** — o solo nativo do planeta não afeta o cultivo
- A **gravidade** é a única variável planetária que influencia o sistema
  - `gravityFactor = 0.7 + gravidade × 0.3`
  - Consumo efetivo de recursos = taxa base × gravityFactor
- Cada horta é **completamente independente** — recursos de uma estufa não afetam outra
- As equações químicas de síntese são **reais e balanceadas**

---

## Planetas

| Planeta | g | Fator gravidade | Consumo relativo |
|---|---|---|---|
| Europa | 0.13 g | 0.739 | 73.9% da Terra |
| Titã | 0.14 g | 0.742 | 74.2% da Terra |
| Lua | 0.17 g | 0.751 | 75.1% da Terra |
| Marte | 0.38 g | 0.814 | 81.4% da Terra |
| Terra | 1.00 g | 1.000 | referência |

---

## Créditos

- **Instituição:** FIAP — Faculdade de Informática e Administração Paulista
- **Projeto:** Global Solution 1 — Mobile Application Development
- **Parceria conceitual:** NASA (contexto acadêmico)
- **Desenvolvedor:** [seu nome]
- **Período:** 2026
