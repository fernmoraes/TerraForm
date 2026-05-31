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
- **Fundo animado de planeta** — imagem do planeta atual sobe e troca com animação ao mudar de planeta
- **Alertas visuais** — seção de alertas ativos no topo da estufa, com classificação crítico / atenção
- **Info do Planeta** — modal com gravidade, fator de consumo e tabela técnica de taxas (ℹ no header)
- **Nutrir Tudo** — modal de aplicação em lote de nutrientes ao solo
- **Controle do Solo** — modal com irrigação por H₂O e correção de pH (CaCO₃, NH₃, H₂CO₃)
- **Controle da Atmosfera** — modal com absorção de CO₂, injeção de O₂ e vaporização de umidade
- **Gestão de Estoque** — 9 elementos brutos em galões + 4 compostos sintetizados
- **Síntese Química** — produzir H₂O, NH₃, CaCO₃ e H₂CO₃ com equações balanceadas e stepper
- **Logs Completos** — histórico agrupado por estufa, filtros por horta / planeta / global, expand/collapse
- **Simulação em tempo real** — consumo automático de nutrientes a cada 15 s (foreground)
- **5 Planetas** — Lua, Marte, Europa, Titã e Terra, com gravidade influenciando as taxas de consumo
- **Onboarding** — 5 slides na primeira abertura; modo revisão + reset via botão "?" no header
- **Tutorial Prático** — guia interativo de 10 passos com estufa demo em Marte (todos os problemas pré-configurados)

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| SDK | Expo SDK | 54 |
| Framework | React Native | 0.81.5 |
| React | React | 19.1.0 |
| Linguagem | TypeScript | ~5.9.2 |
| Navegação | expo-router | ~6.0.24 |
| Estado global | Zustand + `persist` | ^5.0.14 |
| Persistência | AsyncStorage | 2.2.0 |
| Gauges SVG | react-native-svg | 15.12.1 |
| Gradientes | expo-linear-gradient | ~15.0.8 |
| Ícones | @expo/vector-icons | ^15.1.1 |
| Notificações push | expo-haptics | ~15.0.8 (instalado) |
| Feedback tátil | expo-notifications | (pendente) |

> O app roda no **Expo Go SDK 54**. Expo Go com SDK diferente não é compatível.

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- **Expo Go SDK 54** instalado no device (iOS ou Android)

### Passos

```bash
# 1. Instale as dependências
cd TerraForm
npm install

# 2. Inicie o servidor de desenvolvimento
npx expo start

# 3. Escaneie o QR code com o Expo Go no dispositivo
```

---

## Estrutura de Pastas

```
TerraForm/
├── app/
│   ├── _layout.tsx             # Root layout — instancia useSimulation()
│   │                           # Stack.Screen declara rotas concretas (ex: "(auth)/index"),
│   │                           # não nomes de grupo — comportamento do expo-router 6.x
│   ├── index.tsx               # Redirect: aguarda hydration → (auth)/index ou (tabs)/estufa
│   ├── (auth)/
│   │   ├── index.tsx           # Onboarding 5 slides (primeiro-uso + modo revisão)
│   │   └── tutorial.tsx        # Tutorial prático 10 passos com estufa demo
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar + HeaderSelector + botão "?"
│       ├── estufa.tsx          # Dashboard da estufa
│       ├── estoque.tsx         # Galões e compostos
│       ├── sintese.tsx         # Síntese química
│       └── logs.tsx            # Histórico de eventos
│
├── components/
│   ├── ui/
│   │   ├── GaugeCircular.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── NivelIndicator.tsx
│   │   ├── GradientBackground.tsx   # Aceita planetaId opcional (para tutorial)
│   │   ├── PlanetBackground.tsx     # Imagem do planeta animada (sobe ao montar, troca com spring)
│   │   └── CustomAlert.tsx
│   ├── horta/
│   │   ├── GravityIndicator.tsx     # Props: gravidade, planetaNome, planetaId, onPress?
│   │   ├── PlantVisualization.tsx
│   │   ├── NutrienteCard.tsx
│   │   ├── SoloQualidadeCard.tsx
│   │   └── ArQualidadeCard.tsx
│   ├── estoque/
│   │   ├── GallonCard.tsx
│   │   └── CompostoCard.tsx
│   ├── sintese/
│   │   └── ReacaoCard.tsx
│   ├── logs/
│   │   └── LogEntryItem.tsx
│   └── layout/
│       ├── HeaderSelector.tsx
│       ├── PlanetaInfoSheet.tsx     # Modal: gravidade, fator, tabela de consumo técnica
│       ├── NutrirSoloSheet.tsx
│       ├── AtmosferaSheet.tsx
│       └── SoloControleSheet.tsx
│
├── store/
│   ├── hortaStore.ts
│   └── appStore.ts
│
├── data/
│   ├── seed.ts                 # 5 planetas + PLANET_IMAGES + 8 hortas
│   ├── reactions.ts            # 4 reações + REACTION_MAP
│   ├── plants.ts               # 6 espécies + FASE_LABELS + FASES_ORDEM
│   └── tutorialSeed.ts        # Estufa demo com problemas críticos pré-configurados
│
├── types/index.ts
├── constants/
│   ├── colors.ts
│   ├── thresholds.ts
│   └── simulation.ts
├── hooks/
│   ├── useSimulation.ts
│   └── useCustomAlert.ts
├── utils/
│   ├── chemistry.ts
│   ├── agriculture.ts
│   ├── gravity.ts
│   └── formatters.ts
└── assets/
    ├── planets/
    └── crops/
```

---

## Premissas Científicas

- As estufas são **hermeticamente isoladas** — o solo nativo do planeta não afeta o cultivo
- A **gravidade** é a única variável planetária: `gravityFactor = 0.7 + gravidade × 0.3`
- Cada horta é **completamente independente**
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
