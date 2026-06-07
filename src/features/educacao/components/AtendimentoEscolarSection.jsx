import { LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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

const enrollmentSeriesPalette = {
  infantil: "#4DA3FF",
  fundamental: "#67B85F",
  medio: "#E4B63F",
  total: "#F08A24",
};

function getSeriesColor(key, fallback) {
  return enrollmentSeriesPalette[key] ?? fallback;
}

function renderLineTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;

  const filteredPayload = payload.filter((item) => item.dataKey !== "totalArea");

  return (
    <div className="rounded-2xl border border-[rgba(16,33,58,0.10)] bg-white px-4 py-3 text-sm text-[#10213A] shadow-[0_14px_34px_rgba(16,33,58,0.12)]">
      <strong className="text-[#10213A]">{label}</strong>
      <div className="mt-2 grid gap-1.5">
        {filteredPayload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2 text-[#5C6773]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.stroke ?? item.color }}
              />
              {item.name}
            </span>
            <span className="font-semibold text-[#10213A]">
              {integerFormatter.format(item.value)}
            </span>
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
            subtitle="Cada ponto representa um ano do Censo Escolar. As linhas mostram como as matrículas evoluíram por etapa de ensino. O ano selecionado ajuda a localizar o recorte atual sem esconder a série histórica."
          >
            <div className="flex flex-wrap gap-2.5 text-sm">
              {enrollmentHistory.series.map((seriesItem) => {
                const seriesColor = getSeriesColor(seriesItem.key, seriesItem.color);

                return (
                  <span
                    key={seriesItem.key}
                    className="inline-flex items-center rounded-full border border-[rgba(16,33,58,0.10)] bg-white/70 px-3 py-1.5 text-[#10213A]"
                  >
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: seriesColor }}
                    />
                    {seriesItem.label}
                  </span>
                );
              })}
            </div>

            <div className="mt-5 rounded-[24px] bg-[#E9E9DE] p-4">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={enrollmentHistory.chartData.map((row) => ({
                      ...row,
                      totalArea: row.total,
                    }))}
                    margin={{ top: 12, right: 8, bottom: 4, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="educacao-total-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F08A24" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#F08A24" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(16,33,58,0.12)" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="year"
                      stroke="#10213A"
                      tick={{ fill: "#10213A", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(16,33,58,0.16)" }}
                      tickLine={{ stroke: "rgba(16,33,58,0.16)" }}
                    />
                    <YAxis
                      stroke="#10213A"
                      tick={{ fill: "#10213A", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(16,33,58,0.16)" }}
                      tickLine={{ stroke: "rgba(16,33,58,0.16)" }}
                    />
                    <Tooltip content={renderLineTooltip} />
                    <ReferenceLine
                      x={selectedYear}
                      stroke="#F2A116"
                      strokeDasharray="5 5"
                      strokeWidth={1.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalArea"
                      fill="url(#educacao-total-area)"
                      stroke="none"
                      isAnimationActive={false}
                    />
                    {enrollmentHistory.series.map((seriesItem) => {
                      const seriesColor = getSeriesColor(seriesItem.key, seriesItem.color);
                      const isTotal = seriesItem.key === "total";

                      return (
                        <Line
                          key={seriesItem.key}
                          type="monotone"
                          dataKey={seriesItem.key}
                          name={seriesItem.label}
                          stroke={seriesColor}
                          strokeWidth={isTotal ? 3.4 : 2.8}
                          dot={{
                            r: isTotal ? 4.2 : 3.2,
                            fill: seriesColor,
                            stroke: "#E9E9DE",
                            strokeWidth: 1.8,
                          }}
                          activeDot={{
                            r: isTotal ? 6.2 : 5.2,
                            fill: seriesColor,
                            stroke: "#10213A",
                            strokeWidth: 1.8,
                          }}
                        />
                      );
                    })}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
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
