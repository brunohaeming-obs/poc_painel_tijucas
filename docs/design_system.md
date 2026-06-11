# Design System — Tijucas em Dados

> Referência de design para colaboradores. Cobre tokens, sistema de temas, componentes e padrões de implementação.  
> Atualizado em: 2026-06-11.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Tokens de Design](#2-tokens-de-design)
   - [Cores](#21-cores)
   - [Tipografia](#22-tipografia)
   - [Espaçamento](#23-espaçamento)
   - [Bordas e Raio](#24-bordas-e-raio)
   - [Sombras](#25-sombras)
   - [Breakpoints](#26-breakpoints)
3. [Sistema de Temas](#3-sistema-de-temas)
4. [Componentes](#4-componentes)
   - [Layout — Header](#41-header)
   - [EChartCard](#42-echartcard)
   - [KPI Card (Educação)](#43-kpi-card-educação)
   - [Section Header (Educação)](#44-section-header-educação)
   - [Hero (Saúde)](#45-hero-saúde)
   - [Summary Cards (Saúde)](#46-summary-cards-saúde)
   - [Section Card (Saúde)](#47-section-card-saúde)
   - [AnimatedCounter](#48-animatedcounter)
   - [TypewriterText](#49-typewritertext)
5. [Padrões de Layout](#5-padrões-de-layout)
6. [Gráficos](#6-gráficos)
7. [Ícones](#7-ícones)
8. [Animações e Transições](#8-animações-e-transições)
9. [Acessibilidade](#9-acessibilidade)
10. [Criando um Novo Eixo Temático](#10-criando-um-novo-eixo-temático)

---

## 1. Visão Geral

O painel é construído em **React 18 + Vite**, com **Tailwind CSS v3** para estilização e **ECharts / Recharts** para gráficos. A arquitetura é baseada em **eixos temáticos** independentes (Economia, Educação, Contas Públicas, Saúde), cada um com sua própria paleta de destaque mas compartilhando os mesmos tokens base e componentes de infraestrutura.

**Stack principal**

| Camada | Tecnologia |
|---|---|
| UI | React 18, JSX/TSX, Tailwind CSS v3 |
| Gráficos | ECharts 6, Recharts 2 |
| Mapa | Leaflet 1.9 |
| Ícones | lucide-react 0.468 |
| Animações | requestAnimationFrame (nativo) |
| Build | Vite 7 |

---

## 2. Tokens de Design

Os tokens ficam em dois lugares:
- **`tailwind.config.js`** — `theme.extend` para uso via classes Tailwind
- **`src/styles/index.css`** — CSS Custom Properties para uso via `var()` dentro de cada tema

### 2.1 Cores

#### Paleta Institucional (tokens Tailwind)

```js
// tailwind.config.js → theme.extend.colors.brand
{
  navy:       "#000086",  // Azul marinho — cor primária institucional
  blue:       "#007FFE",  // Azul vibrante — destaque Economia
  green:      "#71B434",  // Verde — indicadores positivos
  yellow:     "#FCD418",  // Amarelo ouro — destaque Contas Públicas
  orange:     "#F2A116",  // Laranja — destaque Educação / alertas
  gray:       "#6B7280",  // Cinza neutro — texto secundário
  page:       "#F5F7FA",  // Fundo de página
  border:     "#DDE3EA",  // Bordas claras
  chip:       "#EEF1F4",  // Background de chips/tags
  chipActive: "#D7DCE2",  // Background de chip ativo
}
```

Uso no JSX:
```jsx
<h1 className="text-brand-navy">Título</h1>
<div className="bg-brand-page border border-brand-border">...</div>
```

#### Cor de Destaque por Eixo

Cada eixo define sua cor primária via CSS Custom Property `--axis-primary`. Usar sempre `var(--axis-primary)` em vez de hardcoded hex dentro de componentes de eixo.

| Eixo | `--axis-primary` | Uso |
|---|---|---|
| Economia | `#007FFE` | Série Tijucas em gráficos, botões ativos |
| Educação | `#F2A116` | Badges, ícones, bordas de destaque |
| Contas Públicas | `#FCD418` | Highlights, sombras coloridas |
| Saúde | `#EC4137` | Bordas, ícones, badges |

#### Cor Semântica

```
Verde  (#71B434) → crescimento, indicadores positivos, "acima da meta"
Laranja (#F2A116) → atenção, variação neutra, "em observação"
Vermelho (#EC4137) → queda, indicadores críticos
```

### 2.2 Tipografia

**Font family:** `Inter` (principal) → `Roboto` → `Arial` → `sans-serif`

```html
<!-- index.html: Inter carregado via Google Fonts, pesos 400–800 -->
```

#### Escala de Tamanhos

| Classe Tailwind | px | Uso Típico |
|---|---|---|
| `text-[11px]` | 11 | Labels de eixo em gráfico, metadata de fonte |
| `text-xs` | 12 | Eyebrows, notas de rodapé, badges |
| `text-sm` | 14 | Subtítulos de card, texto auxiliar |
| `text-base` | 16 | Corpo de texto padrão |
| `text-lg` | 18 | Título de card (desktop) |
| `text-xl` | 20 | Título de seção menor |
| `text-2xl` | 24 | Valor numérico de KPI |
| `text-3xl` | 30 | Título de seção principal |
| `text-4xl` | 36 | Headline de hero |
| `text-5xl` | 48 | Valor grande em hero |

#### Pesos

| Classe | Peso | Uso |
|---|---|---|
| `font-normal` | 400 | Corpo de texto longo |
| `font-medium` | 500 | Labels, subtítulos |
| `font-semibold` | 600 | Destacar palavra em frase |
| `font-bold` | 700 | Títulos de card |
| `font-extrabold` | 800 | Eyebrows, KPI values, logotipo |

#### Letter Spacing

Eyebrows e labels em uppercase usam `tracking-` expandido para legibilidade:

```jsx
// Eyebrow padrão
<span className="text-xs font-extrabold uppercase tracking-[0.22em]">
  Seção
</span>
```

Valores usados: `tracking-[0.08em]` até `tracking-[0.24em]`. Aumentar conforme o texto for menor e mais curto.

### 2.3 Espaçamento

Segue a escala padrão do Tailwind (base 4px). Valores mais usados no projeto:

| Token | rem | px | Contexto |
|---|---|---|---|
| `gap-2` | 0.5 | 8 | Espaço interno entre ícone e texto |
| `gap-3` | 0.75 | 12 | Entre badges |
| `gap-4` | 1.0 | 16 | Gap de grid padrão |
| `gap-5` | 1.25 | 20 | Gap em cards |
| `gap-6` | 1.5 | 24 | Gap entre seções menores |
| `gap-8` | 2.0 | 32 | Gap entre seções |
| `gap-10` | 2.5 | 40 | Gap entre seções de página |
| `p-4` / `p-5` | 1.0–1.25 | 16–20 | Padding interno de card mobile |
| `p-5` / `p-6` | 1.25–1.5 | 20–24 | Padding interno de card desktop |
| `px-6 py-6` | — | — | Container mobile |
| `md:px-10 md:py-8` | — | — | Container tablet |
| `2xl:px-16` | — | — | Container wide |

### 2.4 Bordas e Raio

#### Border Radius

```js
// tailwind.config.js — valor customizado
borderRadius: { card: "14px" }
```

| Classe | Valor | Uso |
|---|---|---|
| `rounded-xl` | 12px | Ícone containers, tags pequenas |
| `rounded-2xl` | 16px | Cards menores, tooltips |
| `rounded-[24px]` | 24px | Cards médios |
| `rounded-[28px]` | 28px | Section cards de saúde |
| `rounded-[30px]` | 30px | Cards de hero |
| `rounded-[32px]` | 32px | Containers de destaque |
| `rounded-full` | 9999px | Chips, badges, ícone circular |

#### Bordas

```jsx
// Borda padrão light
<div className="border border-brand-border">

// Borda com opacidade (temas dark / semi-transparentes)
<div className="border border-white/14">

// Borda de eixo (usando CSS var)
style={{ borderColor: "rgba(var(--axis-primary-rgb), 0.28)" }}
```

### 2.5 Sombras

```js
// tailwind.config.js — sombra customizada
boxShadow: { soft: "0 12px 30px rgba(0, 59, 115, 0.08)" }
```

| Contexto | CSS | Uso |
|---|---|---|
| Card padrão | `shadow-soft` | Cards em fundo branco ou cinza |
| Card educação | `0 10px 24px rgba(16,33,58,0.06)` | Cards dark |
| Card KPI educação | `0 14px 32px rgba(15,34,58,0.06)` | Overview cards |
| Card saúde | `0 18px 45px rgba(236,65,55,0.10)` | Section cards com cor |
| Card contas públicas | `0 14px 34px rgba(200,160,0,0.10)` | Cards com yellow accent |
| Hero economia | `0 24px 80px rgba(3,10,34,0.24)` | Destaque absoluto |

A sombra deve sempre usar a **cor primária do eixo** (com baixa opacidade, 6–12%) para criar continuidade visual com a identidade do tema.

### 2.6 Breakpoints

Usa os breakpoints padrão do Tailwind:

| Prefixo | px | Comportamento típico |
|---|---|---|
| _(base)_ | 0 | 1 coluna, padding reduzido |
| `sm:` | 640 | — (pouco usado) |
| `md:` | 768 | 2 colunas, padding aumenta |
| `lg:` | 1024 | 3 colunas, sidebars aparecem |
| `xl:` | 1280 | 4–5 colunas |
| `2xl:` | 1536 | Padding máximo, containers largos |

**Container principal:**
```jsx
<section className="mx-auto max-w-[2200px] px-6 py-6 md:px-10 md:py-8 2xl:px-16">
```

---

## 3. Sistema de Temas

Cada eixo temático é encapsulado por uma **shell class** no elemento raiz da feature. Isso permite que um conjunto de CSS Custom Properties sobrescreva a cor de destaque sem afetar outros eixos na mesma página.

### Como funciona

```jsx
// FeaturePage.jsx
<div className="economia-shell">
  {/* todos os filhos herdam --axis-primary = #007FFE */}
</div>
```

```css
/* src/styles/index.css */
.economia-shell {
  --axis-primary:       #007ffe;
  --axis-primary-rgb:   0, 127, 254;
  --axis-secondary:     #eff6ff;
  --axis-chart-surface: #eff6ff;
  --axis-text-main:     #10213a;
  --axis-text-muted:    #475569;
  --axis-text-soft:     #64748b;
  background: #ffffff;
}
```

### Variáveis disponíveis por tema

| Variável | Descrição |
|---|---|
| `--axis-primary` | Cor de destaque (hex) |
| `--axis-primary-rgb` | Mesma cor em RGB separado (para uso em `rgba()`) |
| `--axis-secondary` | Tom muito claro da cor primária (backgrounds) |
| `--axis-chart-surface` | Fundo de área de gráfico |
| `--axis-text-main` | Texto principal (dark — `#10213a`) |
| `--axis-text-muted` | Texto secundário (`#475569`) |
| `--axis-text-soft` | Texto terciário (`#64748b`) |

### Tabela completa de temas

| Shell class | `--axis-primary` | `--axis-primary-rgb` | Background |
|---|---|---|---|
| `.economia-shell` | `#007ffe` | `0, 127, 254` | `#ffffff` |
| `.educacao-shell` | `#f2a116` | `242, 161, 22` | `#000086` (dark) |
| `.contas-publicas-shell` | `#fcd418` | `252, 212, 24` | `#ffffff` |
| `.health-shell` | `#ec4137` | `236, 65, 55` | `#ffffff` |

### Tema Educação (Dark)

A educação usa um **dark theme completo** diferente dos outros, com painel navy como fundo:

```css
.educacao-shell {
  --color-panel-bg:         #000086;
  --color-panel-bg-soft:    #032a8b;
  --color-panel-card:       rgba(255, 255, 255, 0.06);
  --color-panel-border:     rgba(255, 255, 255, 0.14);
  --color-text-main:        #f8fbff;
  --color-text-muted:       #c8d4ec;
  --color-text-soft:        #93a6c7;
}
```

No tema dark, **textos brancos e cards translúcidos** substituem os tokens padrão. Não misturar os dois sistemas na mesma view.

---

## 4. Componentes

### 4.1 Header

**Arquivo:** `src/shared/layout/Header.jsx`

Cabeçalho global da aplicação. Sticky, com backdrop blur.

```jsx
// Sem props — componente estático
<Header />
```

**Estrutura visual:**
```
┌────────────────────────────────────────────────────────────┐
│  [brasão 48px]  Tijucas em Dados          Observatório... │
└────────────────────────────────────────────────────────────┘
```

**Especificações:**
- `position: sticky; top: 0; z-index: 30`
- Fundo: `bg-white/95 backdrop-blur`
- Logo: `48×48px`, `public/assets/brasao-tijucas.png`
- Título: `text-xl font-extrabold text-brand-navy`
- Subtítulo: `text-sm font-medium text-brand-gray`

---

### 4.2 EChartCard

**Arquivo:** `src/shared/charts/EChartCard.jsx`

Wrapper padronizado para qualquer gráfico ECharts. Garante header, altura e estilos consistentes.

```jsx
<EChartCard
  title="PIB Municipal"
  subtitle="R$ mil correntes — IBGE"
  height={360}
  option={echartsOption}
  variant="light"
  actions={<button>Exportar</button>}
/>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | obrigatório | Título do gráfico |
| `subtitle` | `string` | — | Fonte ou período |
| `height` | `number` | `320` | Altura do canvas em px |
| `option` | `EChartsOption` | obrigatório | Opções do ECharts |
| `variant` | `"light" \| "dark"` | `"light"` | Estilo do container |
| `actions` | `ReactNode` | — | Conteúdo à direita do header |

**Variantes:**

```
light  → classe "card p-6" — fundo branco, borda #DDE3EA
dark   → rounded-lg border border-white bg-white p-5 — idem mas sem shadow-soft
```

---

### 4.3 KPI Card (Educação)

**Arquivo:** `src/features/educacao/components/EducacaoKpiCard.jsx`

Card de indicador com badge de variação. Dois estilos visuais: `default` (dark) e `overview` (light).

```jsx
<EducacaoKpiCard
  item={{
    key: "aprovacao",
    label: "Taxa de Aprovação",
    value: 94.2,
    unit: "%",
    note: "Ensino Fundamental",
    variation: {
      value: 1.4,
      direction: "up",
      previousYear: 92.8,
      deltaText: "+1,4 p.p. vs 2022"
    }
  }}
  variant="default"
  isActive={true}
/>
```

**Estrutura do objeto `item`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `key` | `string` | Identificador único |
| `label` | `string` | Nome do indicador |
| `value` | `number` | Valor principal |
| `unit` | `string` | Unidade (`"%"`, `"escolas"`, `"alunos"`) |
| `note` | `string` | Contexto / recorte |
| `variation.value` | `number` | Delta em relação ao ano anterior |
| `variation.direction` | `"up" \| "down" \| "neutral"` | Direção da variação |
| `variation.deltaText` | `string` | Texto formatado para exibir |
| `lowerIsBetter` | `boolean` | Inverte a semântica de cor (ex.: abandono escolar) |

**Variantes:**

```
default  → Dark navy background, textos brancos, ícone translúcido
overview → Light background, bordas laranja, textos escuros
```

**Cores de badge de variação:**

| `direction` | `lowerIsBetter=false` | `lowerIsBetter=true` |
|---|---|---|
| `up` | Verde (positivo) | Vermelho (negativo) |
| `down` | Vermelho | Verde |
| `neutral` | Cinza | Cinza |

---

### 4.4 Section Header (Educação)

**Arquivo:** `src/features/educacao/components/EducacaoSectionHeader.jsx`

Header de seção do painel de educação. Layout responsivo: empilhado no mobile, inline no desktop.

```jsx
<EducacaoSectionHeader
  eyebrow="Ensino Fundamental"
  title="Resultados de Aprendizagem"
  badge="SAEB 2023"
  description="Desempenho em Língua Portuguesa e Matemática."
  titleId="section-aprendizagem"
/>
```

| Prop | Tipo | Descrição |
|---|---|---|
| `eyebrow` | `string` | Label em uppercase acima do título |
| `title` | `string` | Título principal da seção |
| `badge` | `string` | Tag/pill opcional à direita |
| `description` | `string` | Parágrafo descritivo opcional |
| `titleId` | `string` | `id` para âncora/acessibilidade |

**Estilos:**
- Eyebrow: `text-xs font-bold uppercase tracking-[0.24em] text-slate-300`
- Título: `text-3xl font-extrabold tracking-tight text-white`
- Badge: `rounded-full border border-white/10 bg-white/[0.04] px-4 py-2`

---

### 4.5 Hero (Saúde)

**Arquivo:** `src/components/health/HealthHero.tsx`

Banner introdutório da página de saúde. Inclui eyebrow, título e subtítulo em container com cor de fundo rosada.

```tsx
<HealthHero
  title="Atenção Primária à Saúde"
  subtitle="Cobertura de serviços, procedimentos ambulatoriais e vacinação em Tijucas."
/>
```

| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título principal do eixo |
| `subtitle` | `string` | Descrição curta do conteúdo |

**Especificações:**
- Container: `rounded-[28px] border border-red-200 bg-[#FFEAE9]`
- Sombra: `0 18px 45px rgba(236, 65, 55, 0.10)`
- Eyebrow: `text-xs font-extrabold uppercase tracking-[0.22em] text-red-700`
- Título: `text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950`
- Subtítulo: `text-base font-medium leading-7 text-slate-600`

---

### 4.6 Summary Cards (Saúde)

**Arquivo:** `src/components/health/HealthSummaryCards.tsx`

Grid de 5 cards numéricos com ícone, valor e nota. Recebe array de indicadores.

```tsx
<HealthSummaryCards
  cards={[
    {
      id: "procedimentos",
      label: "Procedimentos/Habitante",
      value: 4.7,
      unit: "proc/hab",
      note: "Média SC: 5.2",
      source: "DATASUS 2024",
      help: "Total de procedimentos ambulatoriais registrados..."
    },
    // ... mais 4 cards
  ]}
/>
```

**Shape de cada card:**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador (usado em ícone) |
| `label` | `string` | Nome do indicador |
| `value` | `number \| string \| null` | Valor exibido |
| `unit` | `string` | Unidade opcional |
| `note` | `string` | Comparativo ou contexto |
| `source` | `string` | Fonte do dado |
| `help` | `string` | Texto de tooltip explicativo |

**Layout:** `grid gap-4 md:grid-cols-2 xl:grid-cols-5`

---

### 4.7 Section Card (Saúde)

**Arquivo:** `src/components/health/HealthSectionCard.tsx`

Container de seção com layout sidebar opcional e narrativa textual.

```tsx
<HealthSectionCard
  eyebrow="Cobertura"
  eyebrowIcon={ShieldCheck}
  title="Cobertura da Atenção Primária"
  subtitle="% de famílias cobertas por equipes de saúde da família"
  narrativeTitle="Análise"
  narrativeHeadline="Tijucas tem cobertura superior à média catarinense"
  narrative="Em 2024, a cobertura de APS atingiu 87,3%..."
  narrativeSource="SISAB 2024"
  sidebarPosition="right"
>
  {/* gráfico ou tabela */}
</HealthSectionCard>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | obrigatório | Título da seção |
| `subtitle` | `string` | obrigatório | Descrição do indicador |
| `eyebrow` | `string` | — | Label de categoria |
| `eyebrowIcon` | `LucideIcon` | — | Ícone ao lado do eyebrow |
| `narrative*` | `string` | — | Textos do painel narrativo lateral |
| `sidebarPosition` | `"left" \| "right"` | `"right"` | Lado do painel narrativo |
| `actions` | `ReactNode` | — | Botões de modo no header |

**Layout com sidebar:**
```
xl: grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)]
```

---

### 4.8 AnimatedCounter

**Arquivo:** `src/features/educacao/components/AnimatedCounter.jsx`

Anima um número de 0 até `value` ao ser montado ou quando `animateKey` muda.

```jsx
<AnimatedCounter
  value={94.2}
  duration={1100}
  formatter={(v) => v.toFixed(1) + "%"}
  isActive={true}
  animateKey="ano-2023"
/>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `number` | obrigatório | Valor final |
| `duration` | `number` | `1100` | Duração em ms |
| `formatter` | `(v: number) => string` | `String(v)` | Formata o valor exibido |
| `isActive` | `boolean` | `true` | Inicia a animação |
| `animateKey` | `string` | — | Reinicia a animação quando muda |

**Comportamento:** usa easing quadrático `1 - (1 - t)²`. Respeita `prefers-reduced-motion` mostrando o valor final diretamente.

---

### 4.9 TypewriterText

**Arquivo:** `src/shared/components/TypewriterText.jsx`

Exibe um texto revelando palavra por palavra, simulando digitação.

```jsx
<TypewriterText
  text="Em 2023, Tijucas registrou crescimento acima da média regional..."
  isActive={true}
  restartKey="secao-aprendizagem"
  intervalMs={60}
  className="text-sm leading-relaxed text-slate-300"
/>
```

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `text` | `string` | obrigatório | Texto completo a revelar |
| `isActive` | `boolean` | `true` | Inicia a animação |
| `restartKey` | `string` | — | Reinicia quando o valor muda |
| `intervalMs` | `number` | `60` | ms entre cada palavra |
| `className` | `string` | — | Classes Tailwind adicionais |

Respeita `prefers-reduced-motion` exibindo o texto completo imediatamente.

---

## 5. Padrões de Layout

### Shell de página

Cada eixo temático segue esta estrutura de container:

```jsx
<div className="nome-eixo-shell">
  <section className="mx-auto max-w-[2200px] px-6 py-6 md:px-10 md:py-8 2xl:px-16">
    <HeroComponent />
    <div className="mt-6 space-y-6">
      <SectionCard>...</SectionCard>
      <SectionCard>...</SectionCard>
    </div>
  </section>
</div>
```

### Grid de KPIs

```jsx
// 2 colunas → 4 colunas → 5 colunas
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
  {kpis.map((kpi) => <KpiCard key={kpi.key} item={kpi} />)}
</div>
```

### Layout de seção com gráfico + narrativa

```jsx
// Sidebar direita
<div className="grid gap-8 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)]">
  <aside>{/* narrativa / insights */}</aside>
  <main>{/* gráfico */}</main>
</div>

// Sidebar esquerda (inverter ordem no DOM ou usar order-)
<div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
  <main>{/* gráfico */}</main>
  <aside>{/* narrativa */}</aside>
</div>
```

### Card base (light theme)

```jsx
// A classe "card" é definida em index.css como shorthand
<article className="card p-5 md:p-6">
  {/* conteúdo */}
</article>
```

```css
/* src/styles/index.css */
.card {
  background: #ffffff;
  border: 1px solid #dde3ea;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 59, 115, 0.08);
}
```

### Card com cor de eixo (bordas dinâmicas)

```jsx
<article
  className="rounded-2xl border p-5"
  style={{
    borderColor: `rgba(var(--axis-primary-rgb), 0.28)`,
    background: `rgba(var(--axis-primary-rgb), 0.04)`,
    boxShadow: `0 12px 28px rgba(var(--axis-primary-rgb), 0.08)`
  }}
>
```

---

## 6. Gráficos

### 6.1 ECharts

**Arquivo de opções:** `src/shared/charts/echartsOptions.js`  
**Paleta:** `src/shared/charts/palette.js`

```js
// palette.js — usar sempre este objeto para cores de gráfico
export const palette = {
  navy:   "#000086",
  blue:   "#007FFE",
  yellow: "#FCD418",
  orange: "#F2A116",
  green:  "#71B434",
  border: "#DDE3EA",
  text:   "#1F2937",
};
```

**Builders disponíveis:**

```js
import { lineOption, barOption, pieOption, baseGrid } from "@/shared/charts/echartsOptions";

// Linha (série única ou múltipla)
const option = lineOption({
  xData:   ["2019","2020","2021","2022","2023"],
  series:  [{ name: "Tijucas", data: [100, 110, 105, 120, 130], color: palette.blue }],
  yLabel:  "R$ mil",
  tooltip: true,
});

// Barra
const option = barOption({
  xData:    categorias,
  series:   [{ name: "Receitas", data: valores, color: palette.yellow }],
  yLabel:   "R$ mil",
  vertical: false,   // true = horizontal
});

// Pizza
const option = pieOption([
  { name: "Saúde", value: 28 },
  { name: "Educação", value: 25 },
]);
```

**Grid padrão:**
```js
// baseGrid() retorna:
{ left: 58, right: 36, top: 46, bottom: 42 }
```

### 6.2 Recharts (Economia)

Recharts é usado exclusivamente no eixo Economia para gráficos de linha e barra. A cor de Tijucas é sempre `#007FFE` como série de destaque. Cores de comparação são sorteadas do array:

```js
const comparisonColors = [
  "#71B434", "#F2A116", "#14B8A6", "#8B5CF6",
  "#F97316", "#94A3B8", "#0EA5E9"
];
```

### 6.3 Série "Tijucas" em gráficos de comparação

Tijucas deve **sempre** se destacar visualmente das séries de comparação:

- **Espessura de linha:** `strokeWidth={3}` (comparações: `2`)
- **Cor:** `var(--axis-primary)` ou cor primária do eixo
- **Opacidade:** 100% (comparações: 70–80%)
- **Ponto de destaque:** dot maior ou cor diferente na última anotação

---

## 7. Ícones

Todos os ícones vêm de **`lucide-react`**. Não usar outras libraries de ícones.

### Ícones por eixo

| Eixo | Ícones principais |
|---|---|
| Geral | `ChevronDown`, `Info` |
| Economia | `BarChart3`, `BriefcaseBusiness`, `TrendingUp`, `MapPinned` |
| Educação | `School`, `GraduationCap`, `Wifi`, `Accessibility`, `Droplets` |
| Saúde | `Activity`, `HeartPulse`, `UsersRound`, `ShieldCheck`, `Syringe` |
| Contas Públicas | `Banknote`, `Building2`, `Hammer`, `Landmark`, `ReceiptText` |

### Tamanhos padrão

```jsx
// Em card header
<Icon size={18} />

// Em ícone container (h-9 w-9)
<Icon size={16} />

// Em ícone grande (h-12 w-12)
<Icon size={20} />

// Em eyebrow / badge
<Icon size={12} />
```

### Container de ícone

```jsx
// Light
<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-700">
  <Activity size={16} />
</span>

// Dark (educação)
<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
  <School size={20} className="text-white" />
</span>
```

---

## 8. Animações e Transições

### Regras gerais

1. Toda animação deve respeitar `prefers-reduced-motion` — exibir estado final sem transição.
2. Transições de hover: `transition-all duration-150` ou `duration-200`.
3. Animações de entrada: usar `AnimatedCounter` e `TypewriterText` em vez de CSS puro.
4. Não usar `setTimeout` para animações — preferir `requestAnimationFrame`.

### Hover padrão em cards interativos

```jsx
<button className="... transition-all duration-150 hover:scale-[1.01] hover:shadow-md active:scale-[0.99]">
```

### Hover padrão em botões de modo

```jsx
<button
  className={cn(
    "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150",
    isActive
      ? "bg-[var(--axis-primary)] text-white"
      : "border border-brand-border bg-white text-slate-700 hover:border-brand-blue hover:text-brand-blue"
  )}
>
```

---

## 9. Acessibilidade

### Focus visible

```css
/* src/styles/index.css */
:focus-visible {
  outline: 3px solid rgba(0, 94, 168, 0.28);
  outline-offset: 2px;
}
```

Não remover o `focus-visible`. Apenas ocultar o foco com `focus:outline-none` em elementos que têm estilo de foco próprio.

### ARIA

- Botões de modo (toggle): usar `aria-pressed={isActive}`.
- Expansões (accordion, dropdown): usar `aria-expanded`.
- Conteúdo dinâmico (gráfico atualiza): usar `aria-live="polite"` no container de resultado.
- Ícones decorativos: `aria-hidden="true"`.
- Ícones funcionais (único filho de button): `aria-label` no botão pai.

### HTML semântico

```jsx
// Hierarquia de headings por página
<main>
  <article>       // card ou seção autônoma
    <header>      // cabeçalho da seção
      <h2>...</h2>
    </header>
    <section>     // subseção
      <h3>...</h3>
    </section>
  </article>
</main>
```

### Contraste mínimo

| Combinação | Nível |
|---|---|
| `text-white` em `bg-brand-navy` | AA |
| `text-slate-950` em `bg-[#FFEAE9]` | AA |
| `text-brand-gray` em `bg-white` | AA |
| `text-[11px]` uppercase em fundo claro | AA Large |

---

## 10. Criando um Novo Eixo Temático

Siga este checklist ao adicionar um novo eixo:

### 1. Definir cor primária

Escolher uma cor que não conflite com as existentes (azul, laranja, amarelo, vermelho já usados).

```css
/* src/styles/index.css */
.novo-eixo-shell {
  --axis-primary:       #HEX;
  --axis-primary-rgb:   R, G, B;
  --axis-secondary:     #HEX-claro;
  --axis-chart-surface: #HEX-claro;
  --axis-text-main:     #10213a;
  --axis-text-muted:    #475569;
  --axis-text-soft:     #64748b;
  background: #ffffff;
}
```

### 2. Criar estrutura de arquivos

```
src/features/novo-eixo/
├── NovoEixoPage.jsx          # Componente de página (orquestrador)
├── components/               # Componentes específicos do eixo
│   ├── NovoEixoHeader.jsx
│   └── NovoEixoKpiCard.jsx
├── config/
│   └── novoEixoTheme.js      # Constantes de cor e configuração
└── data/
    └── (transformadores de dados)
```

### 3. Registrar no ThematicDashboard

```jsx
// src/features/dashboard/ThematicDashboard.jsx
import NovoEixoPage from "../novo-eixo/NovoEixoPage";

// Adicionar no config de axes
{
  id: "novoEixo",
  label: "Novo Eixo",
  icon: IconeApropriado,
  color: "#HEX",
  component: NovoEixoPage,
}
```

### 4. Estrutura mínima da página

```jsx
// NovoEixoPage.jsx
export function NovoEixoPage() {
  return (
    <div className="novo-eixo-shell">
      <section className="mx-auto max-w-[2200px] px-6 py-6 md:px-10 md:py-8 2xl:px-16">
        {/* 1. Hero / banner introdutório */}
        <NovoEixoHero />

        <div className="mt-6 space-y-6">
          {/* 2. KPI Grid com métricas-chave */}
          <KpiGrid />

          {/* 3. Seções de análise com gráficos */}
          <SectionCard title="...">
            <EChartCard option={opcao} />
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
```

### 5. Adicionar ao hash de navegação

```js
// src/features/dashboard/config/axes.js
// Registrar o id para que o link #novoEixo funcione na URL
```

---

*Dúvidas ou sugestões: abrir issue no repositório ou contactar o mantenedor do projeto.*
