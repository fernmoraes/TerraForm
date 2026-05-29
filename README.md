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

TerraForm centraliza o controle operacional de estufas hermeticamente isoladas instaladas em diferentes planetas e luas do sistema solar. O usuário assume o papel de um astronauta-agricultor que monitora e gerencia remotamente cada estufa a partir de um único aplicativo mobile.

**Não é um jogo.** TerraForm é uma ferramenta operacional — pense em um painel SCADA — com interface científica séria.

---

## Funcionalidades Principais

- **Dashboard da Estufa** — estado em tempo real: solo, ar, nutrientes, fase de crescimento das plantas
- **Gestão de Estoque** — 9 elementos brutos em galões (N, P, K, Ca, Mg, S, O, H, C) + 4 compostos sintetizados
- **Síntese Química** — produzir H₂O, NH₃, CaCO₃ e H₂CO₃ a partir dos elementos brutos com equações balanceadas
- **Aplicação de Compostos** — irrigar o solo, corrigir pH, adicionar nutrientes e controlar a atmosfera interna
- **Logs Completos** — histórico cronológico por horta, por planeta ou global
- **Alertas em Tempo Real** — notificações push quando nutrientes ou compostos atingem nível crítico
- **5 Planetas** — Lua, Marte, Europa, Titã e Terra (referência), com gravidade influenciando o cultivo
- **Tutorial de Onboarding** — 5 telas de treinamento exibidas na primeira abertura

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo ~56 |
| Linguagem | TypeScript (strict) |
| Navegação | expo-router (file-based) |
| Estado global | Zustand + `persist` middleware |
| Persistência | AsyncStorage (local, sem backend) |
| Visualizações | react-native-svg (gauges circulares) |
| Gradientes | expo-linear-gradient |
| Notificações | expo-notifications |
| Feedback tátil | expo-haptics |

---

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go instalado no device (iOS ou Android)

### Passos

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd TerraForm

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start

# 4. Escaneie o QR code com o Expo Go no seu dispositivo
```

> O app é projetado para rodar no **Expo Go** sem necessidade de build nativo (`expo prebuild`).

> Notificações push funcionam no Expo Go em **dispositivos Android físicos**. Em simuladores iOS, apenas alertas in-app são exibidos.

---

## Estrutura de Pastas

```
TerraForm/
├── app/                  # Telas (expo-router)
│   ├── (tabs)/           # 4 abas principais
│   │   ├── estufa.tsx    # Dashboard da estufa
│   │   ├── estoque.tsx   # Galões e compostos
│   │   ├── sintese.tsx   # Síntese química
│   │   └── logs.tsx      # Histórico de eventos
│   └── onboarding/       # Tutorial de primeira abertura
├── components/           # Componentes reutilizáveis
│   ├── ui/               # GaugeCircular, ProgressBar, StatusBadge...
│   ├── horta/            # PlantVisualization, NutrienteCard...
│   ├── estoque/          # GallonCard, CompostoCard
│   ├── sintese/          # ReacaoCard
│   ├── logs/             # LogEntryItem
│   └── layout/           # HeaderSelector, AplicarCompostoSheet
├── store/                # Estado global Zustand
├── data/                 # Dados estáticos (seed, reações, espécies)
├── types/                # Tipos TypeScript
├── constants/            # Cores, thresholds, configurações de simulação
├── hooks/                # useSimulation, useAlertCheck
└── utils/                # chemistry, agriculture, gravity, formatters
```

---

## Premissas Científicas

- As estufas são **hermeticamente isoladas** — o solo nativo do planeta não afeta o cultivo
- A **gravidade** é a única variável planetária real que influencia o sistema (evaporação, distribuição de fluidos, desenvolvimento das raízes)
- Cada horta é **completamente independente** — recursos de uma estufa não afetam outra
- As equações químicas de síntese são **reais e balanceadas** (H₂O, NH₃, CaCO₃, H₂CO₃)

---

## Planetas Disponíveis

| Planeta | Gravidade | Influência |
|---|---|---|
| Europa | 0.13 g | Consumo ~74% da Terra |
| Titã | 0.14 g | Consumo ~74% da Terra |
| Lua | 0.17 g | Consumo ~75% da Terra |
| Marte | 0.38 g | Consumo ~81% da Terra |
| Terra | 1.00 g | Referência (100%) |

---

## Screenshots / Mockups

> *Em desenvolvimento — adicionar após Fase 10 (Polish Visual).*

---

## Créditos

- **Instituição:** FIAP — Faculdade de Informática e Administração Paulista
- **Projeto:** Global Solution 1 — Mobile Application Development
- **Parceria conceitual:** NASA (contexto acadêmico)
- **Desenvolvedor:** [seu nome]
- **Período:** 2026
