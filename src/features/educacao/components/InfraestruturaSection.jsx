import { useState } from "react";
import { Info, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EducacaoChartCard } from "./EducacaoChartCard.jsx";
import { EducacaoKpiGrid } from "./EducacaoKpiGrid.jsx";
import { EducacaoNarrativeText } from "./EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

function renderBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#071845] px-4 py-3 text-sm text-white shadow-lg">
      <strong>{label}</strong>
      <div className="mt-2 grid gap-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              {item.name}
            </span>
            <span>{percentFormatter.format(item.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const methodologyText = `Como ler este indicador

Os percentuais mostram a proporção de escolas que declararam possuir cada recurso no Censo Escolar.

A comparação com 2024 indica mudança na declaração entre os anos. Ela pode refletir ampliação real da estrutura, atualização cadastral ou mudança no conjunto de escolas informantes.

Esses indicadores ajudam a observar condições materiais da rede, mas não medem diretamente qualidade do ensino.

No caso de acessibilidade, o painel usa banheiro acessível como aproximação. Esse dado não representa todas as dimensões de acessibilidade escolar.`;

export function InfraestruturaSection({
  selectedYear,
  infrastructureKpis,
  infrastructureChart,
  narratives,
}) {
  const [showMethodology, setShowMethodology] = useState(false);
  const hasComparativo = Boolean(infrastructureChart?.hasReference);
  const chartYear = infrastructureChart?.year ?? 2024;

  return (
    <section className="grid gap-8" aria-labelledby="educacao-infra-title">
      <div className="relative">
        <EducacaoSectionHeader
          titleId="educacao-infra-title"
          eyebrow="Infraestrutura das escolas"
          title="Condições essenciais de funcionamento"
        />

        <div className="relative mt-3 flex items-start justify-start">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#F2A116]"
            onMouseEnter={() => setShowMethodology(true)}
            onMouseLeave={() => setShowMethodology(false)}
            onFocus={() => setShowMethodology(true)}
            onBlur={() => setShowMethodology(false)}
            onClick={() => setShowMethodology((current) => !current)}
            aria-expanded={showMethodology}
            aria-label="Como ler este indicador"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#F2A116] text-[11px] font-bold text-[#10213A]">
              <Info size={12} strokeWidth={2.4} />
            </span>
            Como ler este indicador
          </button>

          {showMethodology ? (
            <div
              className="absolute left-0 top-full z-20 mt-3 w-full max-w-[520px] rounded-3xl border border-white/12 bg-[#071845] p-5 text-sm leading-7 text-slate-200 shadow-2xl"
              onMouseEnter={() => setShowMethodology(true)}
              onMouseLeave={() => setShowMethodology(false)}
            >
              {methodologyText.split("\n\n").map((paragraph, index) => (
                <p key={index} className={index === 0 ? "font-semibold text-white" : "mt-3"}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] xl:items-start">
        <EducacaoNarrativeText
          eyebrow="Leitura de apoio"
          title="Condições básicas da rede"
          body={narratives.infrastructure}
          caption="Os indicadores mostram recursos declarados pelas escolas e ajudam a acompanhar diferenças nas condições básicas de funcionamento da rede."
          className="xl:pt-4"
          icon={Sparkles}
        />
        <EducacaoKpiGrid items={infrastructureKpis} />
      </div>

      <EducacaoChartCard
        title="Recursos comparáveis com Santa Catarina"
        subtitle="Comparação de Tijucas com a média estadual em indicadores selecionados de infraestrutura escolar."
      >
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={infrastructureChart.items}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
              barGap={10}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <XAxis
                type="number"
                stroke="#A8B6D8"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis type="category" dataKey="label" width={210} stroke="#A8B6D8" />
              <Tooltip content={renderBarTooltip} />
              <Bar dataKey="tijucas" name="Tijucas" fill="#007FFE" radius={[0, 10, 10, 0]} />
              {hasComparativo ? (
                <Bar
                  dataKey="reference"
                  name="Santa Catarina"
                  fill="#FCD418"
                  radius={[0, 10, 10, 0]}
                />
              ) : null}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-300">
          {hasComparativo
            ? infrastructureChart.note
            : "Comparativo estadual indisponível nos arquivos atuais."}
        </p>

        <p className="mt-2 text-xs leading-6 text-slate-400">
          {hasComparativo
            ? `Fotografia principal usada no gráfico: ${chartYear}.`
            : `O gráfico segue exibindo apenas Tijucas no recorte disponível de ${selectedYear}.`}
        </p>
      </EducacaoChartCard>
    </section>
  );
}
