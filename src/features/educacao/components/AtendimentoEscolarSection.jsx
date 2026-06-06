import { LineChart as LineChartIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EducacaoChartCard } from "./EducacaoChartCard.jsx";
import { EducacaoChartNarrativeRow } from "./EducacaoChartNarrativeRow.jsx";
import { EducacaoNarrativeText } from "./EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

function renderLineTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#071845] px-4 py-3 text-sm text-white shadow-lg">
      <strong>{label}</strong>
      <div className="mt-2 grid gap-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.stroke }} />
              {item.name}
            </span>
            <span>{integerFormatter.format(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AtendimentoEscolarSection({
  selectedYear,
  enrollmentHistory,
  narratives,
}) {
  return (
    <section className="grid gap-8" aria-labelledby="educacao-atendimento-title">
      <EducacaoSectionHeader
        titleId="educacao-atendimento-title"
        eyebrow="Atendimento escolar"
        title="Evolução da demanda e composição das matrículas"
      />

      <EducacaoChartNarrativeRow
        chart={
          <EducacaoChartCard
            title="Evolução das matrículas por etapa"
            subtitle="Cada ponto representa um ano do Censo Escolar. As linhas mostram como as matrículas evoluíram por etapa de ensino."
          >
            <div className="flex flex-wrap gap-2.5 text-sm">
              {enrollmentHistory.series.map((seriesItem) => (
                <span
                  key={seriesItem.key}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-100"
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seriesItem.color }}
                  />
                  {seriesItem.label}
                </span>
              ))}
            </div>

            <div className="mt-5 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentHistory.chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <XAxis dataKey="year" stroke="#A8B6D8" />
                  <YAxis stroke="#A8B6D8" />
                  <Tooltip content={renderLineTooltip} />
                  <ReferenceLine
                    x={selectedYear}
                    stroke="rgba(252,212,24,0.95)"
                    strokeDasharray="5 5"
                  />
                  {enrollmentHistory.series.map((seriesItem) => (
                    <Line
                      key={seriesItem.key}
                      type="monotone"
                      dataKey={seriesItem.key}
                      name={seriesItem.label}
                      stroke={seriesItem.color}
                      strokeWidth={seriesItem.key === "total" ? 3.8 : 2.6}
                      dot={{
                        r: seriesItem.key === "total" ? 4.4 : 3.4,
                        fill: seriesItem.color,
                        stroke: "#071845",
                        strokeWidth: 1.5,
                      }}
                      activeDot={{
                        r: seriesItem.key === "total" ? 6 : 5,
                        fill: seriesItem.color,
                        stroke: "#FCD418",
                        strokeWidth: 2,
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </EducacaoChartCard>
        }
        narrative={
          <EducacaoNarrativeText
            eyebrow="Leitura da série"
            title="Como a demanda escolar mudou?"
            body={narratives.enrollmentTrend}
            caption={narratives.enrollmentTrendNote}
            className="w-full"
            icon={LineChartIcon}
          />
        }
      />
    </section>
  );
}
