// Painel escuro padrão dos eixos sem página dedicada (saúde, população,
// meio ambiente e construção civil): narrativa + KPIs à esquerda e cards à direita.
import { EChartCard } from "../../../shared/charts/EChartCard.jsx";
import { ObrasMapCard } from "../../construcao-civil/components/ObrasMapCard.jsx";
import { ObrasSeriesCharts } from "../../construcao-civil/components/ObrasSeriesCharts.jsx";
import { axisNarratives } from "../config/axes.js";
import { buildAxisCards } from "../axisCardBuilders.js";

export function AxisPanel({ theme }) {
  const cards = buildAxisCards(theme);
  const visibleCards = theme.id === "construcaoCivil" ? cards : cards.slice(0, 2);
  const narrative = axisNarratives[theme.id] ?? theme.summary;
  const supportingText = theme.summary;
  const kpis = theme.kpis ?? [];

  return (
    <div className="rounded-lg bg-brand-navy p-5 text-white shadow-soft md:p-6 2xl:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.82fr)_minmax(0,2.55fr)] 2xl:gap-8">
        <aside className="flex flex-col gap-4 xl:self-start">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-normal text-brand-yellow">
              Eixo selecionado
            </span>
            <h3 className="mt-3 text-3xl font-extrabold leading-tight text-white 2xl:text-4xl">
              {theme.label}
            </h3>
            <p className="mt-5 text-base font-semibold leading-7 text-white xl:text-[15px] xl:leading-7 2xl:text-base">
              {narrative}
            </p>
            <p className="mt-4 text-sm font-medium leading-6 text-blue-50">{supportingText}</p>
          </div>

          <div className="grid gap-3">
            {kpis.slice(0, 3).map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white bg-white px-5 py-4 2xl:px-6 2xl:py-5"
              >
                <p className="text-xs font-bold uppercase tracking-normal text-slate-700">
                  {item.label}
                </p>
                <strong className="mt-2 block text-2xl font-extrabold text-brand-navy 2xl:text-3xl">
                  {item.value}
                </strong>
                <span className="text-xs font-semibold text-slate-700">{item.note}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="grid gap-6 lg:grid-cols-2 2xl:gap-8">
          {visibleCards.map((card) =>
            card.kind === "map" ? (
              <ObrasMapCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                height={520}
                className="lg:col-span-2"
              />
            ) : card.kind === "obrasSeries" ? (
              <ObrasSeriesCharts key="obras-series" className="lg:col-span-2" />
            ) : (
              <EChartCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                height={card.height ?? 560}
                option={card.option}
                variant="dark"
                actions={card.actions}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
