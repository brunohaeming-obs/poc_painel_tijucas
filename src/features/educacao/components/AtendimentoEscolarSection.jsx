import { BookCopy, LineChart as LineChartIcon } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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

function renderPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#071845] px-4 py-3 text-sm text-white shadow-lg">
      <strong>{point.label}</strong>
      <p className="mt-1 text-slate-300">{integerFormatter.format(point.value)} matrículas</p>
    </div>
  );
}

export function AtendimentoEscolarSection({
  selectedYear,
  enrollmentHistory,
  enrollmentComposition,
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
            subtitle="A série histórica permanece completa e o ano filtrado aparece como destaque visual."
          >
            <div className="flex flex-wrap gap-3 text-sm">
              {enrollmentHistory.series.map((seriesItem) => (
                <span
                  key={seriesItem.key}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200"
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
                      strokeWidth={seriesItem.key === "total" ? 2.2 : 3}
                      dot={false}
                      strokeDasharray={seriesItem.key === "total" ? "7 4" : undefined}
                      activeDot={{ r: 5 }}
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
            title="O atendimento não se resume ao total"
            body={narratives.enrollmentTrend}
            className="w-full"
            icon={LineChartIcon}
          />
        }
      />

      <EducacaoChartNarrativeRow
        chart={
          <EducacaoChartCard
            title={`Composição das matrículas em ${selectedYear}`}
            subtitle="Distribuição do atendimento por etapa no ano selecionado."
          >
            {enrollmentComposition.items.length ? (
              <>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={enrollmentComposition.items}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={64}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={2}
                      >
                        {enrollmentComposition.items.map((item) => (
                          <Cell key={item.label} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip content={renderPieTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-2">
                  {enrollmentComposition.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-slate-200">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                      </span>
                      <strong className="text-white">{integerFormatter.format(item.value)}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm leading-7 text-slate-300">
                Sem dados suficientes para a composição de matrículas no ano selecionado.
              </p>
            )}
          </EducacaoChartCard>
        }
        narrative={
          <EducacaoNarrativeText
            eyebrow="Composição"
            title="Quais etapas puxam o perfil da rede"
            body={narratives.enrollmentComposition}
            caption="EJA e educação especial aparecem apenas quando ajudam a leitura e não poluem a composição."
            className="w-full"
            icon={BookCopy}
          />
        }
      />
    </section>
  );
}
