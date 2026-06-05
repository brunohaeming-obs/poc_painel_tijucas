import { Sparkles } from "lucide-react";
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

export function InfraestruturaSection({
  selectedYear,
  infrastructureKpis,
  infrastructureChart,
  narratives,
}) {
  const hasComparativo = Boolean(infrastructureChart?.hasReference);
  const chartYear = infrastructureChart?.year ?? 2024;

  return (
    <section className="grid gap-8" aria-labelledby="educacao-infra-title">
      <EducacaoSectionHeader
        titleId="educacao-infra-title"
        eyebrow="Infraestrutura das escolas"
        title="Condições essenciais de funcionamento"
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] xl:items-start">
        <EducacaoNarrativeText
          eyebrow="Leitura de apoio"
          title="Infraestrutura ajuda a ler a capacidade da rede"
          body={narratives.infrastructure}
          caption="Os indicadores de infraestrutura não medem diretamente a qualidade do ensino, mas ajudam a compreender as condições materiais da rede."
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
