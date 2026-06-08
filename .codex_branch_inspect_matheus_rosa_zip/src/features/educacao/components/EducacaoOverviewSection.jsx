import { useEffect, useRef, useState } from "react";
import { Building2, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EducacaoKpiGrid } from "./EducacaoKpiGrid.jsx";
import { EducacaoNarrativeText } from "./EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";
import { TypewriterText } from "../../../shared/components/TypewriterText.jsx";

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

function renderTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const share =
    point.total > 0 ? `${percentFormatter.format((point.value / point.total) * 100)}%` : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg">
      <strong className="text-[color:#10213A]">{point.label}</strong>
      <p className="mt-1 text-slate-600">{point.value} escolas</p>
      {share ? <p className="text-slate-600">{share} da rede no ano selecionado</p> : null}
    </div>
  );
}

function buildLegendShare(itemValue, total) {
  if (!total) {
    return null;
  }

  return `${percentFormatter.format((itemValue / total) * 100)}%`;
}

export function EducacaoOverviewSection({ selectedYear, kpis, composition, narratives }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.28,
        rootMargin: "-8% 0px -12% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const compositionItems = composition.items.map((item) => ({
    ...item,
    total: composition.total,
  }));

  return (
    <section ref={sectionRef} className="grid gap-8" aria-labelledby="educacao-overview-title">
      <EducacaoSectionHeader
        titleId="educacao-overview-title"
        eyebrow="Visão geral"
        title="Tamanho da rede e sinais iniciais de atendimento"
        badge={`Ano selecionado: ${selectedYear}`}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(280px,1.08fr)_minmax(340px,1.05fr)_minmax(300px,0.95fr)] xl:items-stretch">
        <article className="h-full rounded-[28px] border border-[rgba(242,161,22,0.16)] bg-[#FCFCFD] p-6 shadow-[0_18px_44px_rgba(15,34,58,0.06)] xl:pt-8 xl:p-7">
          <EducacaoNarrativeText
            eyebrow="Leitura automatizada"
            title="Retrato síntese da rede"
            eyebrowClassName="text-slate-500"
            titleClassName="text-[color:#10213A]"
            bodyContent={
              <TypewriterText
                text={narratives.overview}
                isActive={isVisible}
                restartKey={selectedYear}
                className="mt-4 block text-base italic leading-8 text-slate-700"
              />
            }
            caption="A narrativa é montada localmente a partir dos indicadores reais carregados no painel."
            captionClassName="text-slate-500"
            icon={TrendingUp}
            className="h-full max-w-none"
          />
        </article>

        <div className="grid">
          <EducacaoKpiGrid
            items={kpis}
            variant="overview"
            isActive={isVisible}
            animateKey={selectedYear}
          />
        </div>

        <article className="flex min-h-[452px] flex-col rounded-[28px] border border-[rgba(242,161,22,0.16)] bg-[#E9E9DE] p-6 shadow-[0_18px_44px_rgba(15,34,58,0.06)]">
          <div>
            <h3 className="text-xl font-extrabold text-[#10213A]">
              {`Escolas por dependência em ${selectedYear}`}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{narratives.schoolComposition}</p>
          </div>

          {compositionItems.length ? (
            <div className="flex h-full flex-col">
              <div className="h-[270px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={compositionItems}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={68}
                      outerRadius={106}
                      paddingAngle={2}
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth={2}
                    >
                      {compositionItems.map((entry) => (
                        <Cell key={entry.label} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 grid gap-3">
                {compositionItems.map((item) => {
                  const share = buildLegendShare(item.value, composition.total);

                  return (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-[#10213A]">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <div className="text-right">
                        <strong className="block text-[#10213A]">{item.value} escolas</strong>
                        {share ? (
                          <span className="text-xs font-semibold text-slate-600">{share}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium italic tracking-[0.04em] text-slate-600">
                <Building2 size={14} />
                <span>Total no ano selecionado: {composition.total} escolas</span>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-7 text-slate-700">
              Sem dados suficientes para compor a rosca da rede no ano selecionado.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
