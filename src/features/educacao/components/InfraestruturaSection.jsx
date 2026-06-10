import { useState } from "react";
import { Info, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EducacaoChartCard } from "./EducacaoChartCard.jsx";
import { EducacaoNarrativeText } from "./EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const methodologyText = `Como ler este indicador

Os percentuais mostram a proporção de escolas que declararam possuir cada recurso no Censo Escolar.

A comparação com 2024 indica mudança na declaração entre os anos. Ela pode refletir ampliação real da estrutura, atualização cadastral ou mudança no conjunto de escolas informantes.

Esses indicadores ajudam a observar condições materiais da rede, mas não medem diretamente qualidade do ensino.

No caso de acessibilidade, o painel usa banheiro acessível como aproximação. Esse dado não representa todas as dimensões de acessibilidade escolar.`;

function renderBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[rgba(16,33,58,0.10)] bg-white px-4 py-3 text-sm text-[#10213A] shadow-[0_14px_34px_rgba(16,33,58,0.12)]">
      <strong className="text-[#10213A]">{label}</strong>
      <div className="mt-2 grid gap-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2 text-[#5C6773]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              {item.name}
            </span>
            <span className="font-semibold text-[#10213A]">
              {item.value === null || item.value === undefined || Number.isNaN(item.value)
                ? "N/D"
                : `${percentFormatter.format(item.value)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderHistoryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[rgba(16,33,58,0.10)] bg-white px-4 py-3 text-sm text-[#10213A] shadow-[0_14px_34px_rgba(16,33,58,0.12)]">
      <strong className="text-[#10213A]">{label}</strong>
      <div className="mt-2 grid gap-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2 text-[#5C6773]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.stroke }}
              />
              {item.name}
            </span>
            <span className="font-semibold text-[#10213A]">
              {item.value === null || item.value === undefined || Number.isNaN(item.value)
                ? "N/D"
                : `${percentFormatter.format(item.value)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InfraestruturaSection({
  selectedYear,
  infrastructureChart,
  infrastructureHistory,
  narratives,
}) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [activeHistoryKey, setActiveHistoryKey] = useState("internet");

  const hasComparativo = Boolean(infrastructureChart?.hasReference);
  const chartItems = infrastructureChart?.items ?? [];
  const historyItems = infrastructureHistory ?? [];
  const activeSeries = historyItems.find((s) => s.key === activeHistoryKey) ?? null;

  return (
    <section className="grid gap-8" aria-labelledby="educacao-infra-title">
      <div className="relative">
        <EducacaoSectionHeader
          titleId="educacao-infra-title"
          eyebrow="Infraestrutura das escolas"
          title="Condições essenciais de funcionamento"
        />

        <div className="relative isolate mt-3 flex items-start justify-start">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(242,161,22,0.28)] bg-[#FDE7C2] px-3 py-1.5 text-xs font-semibold text-[#10213A] transition hover:border-[rgba(242,161,22,0.4)] hover:bg-[#F8DCA7] focus:outline-none focus:ring-2 focus:ring-[#F2A116]"
            onMouseEnter={() => setShowMethodology(true)}
            onMouseLeave={() => setShowMethodology(false)}
            onFocus={() => setShowMethodology(true)}
            onBlur={() => setShowMethodology(false)}
            onClick={() => setShowMethodology((current) => !current)}
            aria-expanded={showMethodology}
            aria-label="Como ler este indicador"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border border-[rgba(242,161,22,0.35)] bg-white text-[11px] font-bold text-[#F2A116]">
              <Info size={12} strokeWidth={2.4} />
            </span>
            Como ler este indicador
          </button>

          {showMethodology ? (
            <div
              className="absolute left-0 top-full z-50 mt-3 w-full max-w-[520px] rounded-3xl border border-[#F2A116] bg-[#FDE7C2] p-5 text-sm leading-7 text-[#10213A] shadow-[0_18px_40px_rgba(16,33,58,0.18)]"
              onMouseEnter={() => setShowMethodology(true)}
              onMouseLeave={() => setShowMethodology(false)}
            >
              {methodologyText.split("\n\n").map((paragraph, index) => (
                <p
                  key={index}
                  className={index === 0 ? "font-semibold text-[#10213A]" : "mt-3 text-[#10213A]"}
                >
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

        {historyItems.length ? (
          <EducacaoChartCard
            title={
              activeSeries
                ? `Série histórica: ${activeSeries.label}`
                : "Série histórica de infraestrutura"
            }
            subtitle={
              activeSeries?.hasSc
                ? "Tijucas comparada com a média de Santa Catarina. Fonte: Censo Escolar/INEP."
                : "Dados de Tijucas. Comparação estadual não disponível para este indicador."
            }
          >
            <div className="flex flex-wrap gap-2">
              {historyItems.map((series) => (
                <button
                  key={series.key}
                  type="button"
                  onClick={() => setActiveHistoryKey(series.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    activeHistoryKey === series.key
                      ? "border-[#F2A116] bg-[#F2A116] text-white"
                      : "border-[rgba(16,33,58,0.14)] bg-white text-[#10213A] hover:border-[#F2A116] hover:text-[#F2A116]"
                  }`}
                >
                  {series.label}
                </button>
              ))}
            </div>

            {activeSeries?.chartData?.length ? (
              <div className="mt-5 rounded-[24px] bg-[#E9E9DE] p-5">
                <div className="mb-4 flex flex-wrap items-center gap-5 text-sm text-[#10213A]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#F2A116]" />
                    Tijucas
                  </span>
                  {activeSeries.hasSc ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-0.5 w-5 rounded-full"
                        style={{
                          background:
                            "repeating-linear-gradient(to right,#4DA3FF 0,#4DA3FF 5px,transparent 5px,transparent 8px)",
                        }}
                      />
                      Santa Catarina
                    </span>
                  ) : null}
                </div>

                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activeSeries.chartData}
                      margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
                    >
                      <CartesianGrid stroke="rgba(16,33,58,0.10)" strokeDasharray="4 4" />
                      <XAxis
                        dataKey="year"
                        tick={{ fill: "#10213A", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                        axisLine={{ stroke: "rgba(16,33,58,0.16)" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fill: "#10213A", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                      />
                      <Tooltip content={renderHistoryTooltip} />
                      <Line
                        type="monotone"
                        dataKey="tijucas"
                        name="Tijucas"
                        stroke="#F2A116"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#F2A116", strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                      {activeSeries.hasSc ? (
                        <Line
                          type="monotone"
                          dataKey="sc"
                          name="Santa Catarina"
                          stroke="#4DA3FF"
                          strokeWidth={2.5}
                          strokeDasharray="5 3"
                          dot={{ r: 4, fill: "#4DA3FF", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      ) : null}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Dados históricos não disponíveis.</p>
            )}

            <p className="mt-5 text-sm leading-6 text-slate-300">
              {activeSeries?.hasSc
                ? "Série 2019–2024. Comparativo estadual restrito ao período com estrutura comparável."
                : "Série 2014–2025 para Tijucas. Comparativo estadual não disponível para este indicador."}
            </p>
          </EducacaoChartCard>
        ) : null}
      </div>


      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.28fr)_minmax(280px,0.72fr)] xl:items-start">
      <EducacaoChartCard
        title="Recursos das escolas: Tijucas x Santa Catarina"
        subtitle="Percentual de escolas que declararam possuir cada recurso em 2024."
      >
        <div className="rounded-[24px] bg-[#E9E9DE] p-5">
          <div className="mb-4 flex flex-wrap items-center gap-5 text-sm text-[#10213A]">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#F2A116]" />
              Tijucas
            </span>
            {hasComparativo ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#4DA3FF]" />
                Santa Catarina
              </span>
            ) : null}
          </div>

          {chartItems.length ? (
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartItems}
                  layout="vertical"
                  margin={{ top: 12, right: 28, bottom: 10, left: 24 }}
                  barGap={10}
                  barCategoryGap={18}
                >
                  <CartesianGrid
                    stroke="rgba(16,33,58,0.12)"
                    strokeDasharray="4 4"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#10213A"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: "#10213A", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                    axisLine={{ stroke: "rgba(16,33,58,0.16)" }}
                    tickLine={{ stroke: "rgba(16,33,58,0.16)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={230}
                    stroke="#10213A"
                    tick={{ fill: "#10213A", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderBarTooltip} cursor={{ fill: "rgba(16,33,58,0.04)" }} />
                  <Bar
                    dataKey="tijucas"
                    name="Tijucas"
                    fill="#F2A116"
                    radius={[0, 9, 9, 0]}
                    barSize={16}
                  />
                  {hasComparativo ? (
                    <Bar
                      dataKey="reference"
                      name="Santa Catarina"
                      fill="#4DA3FF"
                      radius={[0, 9, 9, 0]}
                      barSize={16}
                    />
                  ) : null}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[#10213A]">
              Dados comparativos indisponíveis para o gráfico.
            </p>
          )}
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-300">
          Comparação com base no Censo Escolar 2024. Os percentuais representam escolas que
          declararam possuir cada recurso. Banheiro acessível é usado como aproximação parcial de
          acessibilidade.
        </p>
      </EducacaoChartCard>

      <EducacaoNarrativeText
        eyebrow="Condições materiais"
        title="Conectividade universal, mas brechas em esporte e tecnologia"
        body="Tijucas universalizou o acesso à internet nas escolas e tem índice de refeitório acima de 80% — base sólida para continuidade das aulas. Laboratórios de informática e quadras esportivas ficam abaixo da média catarinense: recursos que ampliam o repertório prático dos alunos e o tempo de aprendizagem ativa. O indicador de banheiro acessível supera o estado, embora represente apenas uma dimensão da acessibilidade física escolar."
        caption="Fonte: Censo Escolar / INEP 2024. Declaração pelas escolas — sujeita a variação na atualização cadastral."
        icon={Sparkles}
        className="xl:pt-4"
      />
      </div>
    </section>
  );
}
