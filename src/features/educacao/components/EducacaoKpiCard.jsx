import {
  Accessibility,
  Droplets,
  GraduationCap,
  School,
  Soup,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter.jsx";

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const iconMap = {
  schools: School,
  enrollments: GraduationCap,
  internet: Wifi,
  accessibility: Accessibility,
  water: Droplets,
  refectory: Soup,
};

function getVariationClasses(direction, isOverview) {
  if (!isOverview) {
    if (direction === "up") {
      return "bg-emerald-400/14 text-emerald-100";
    }
    if (direction === "down") {
      return "bg-rose-400/14 text-rose-100";
    }
    return "bg-white/10 text-slate-100";
  }

  if (direction === "up") {
    return "bg-lime-100 text-lime-700";
  }
  if (direction === "down") {
    return "bg-orange-100 text-orange-700";
  }
  return "bg-white/80 text-slate-600";
}

function getVariationIcon(direction) {
  if (direction === "up") {
    return TrendingUp;
  }
  if (direction === "down") {
    return TrendingDown;
  }
  return null;
}

function formatAnimatedValue(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Sem dado";
  }

  if (unit === "%") {
    return `${decimalFormatter.format(value)}%`;
  }

  return `${integerFormatter.format(value)} ${unit}`;
}

function buildOverviewVariationText(variation) {
  if (!variation || variation.value === null || !variation.previousYear) {
    return "Sem comparação anual disponível";
  }

  if (variation.value === 0) {
    return `Sem mudança desde ${variation.previousYear}`;
  }

  const cleanDeltaText = variation.deltaText.replace(/^[+-]/, "");
  const directionLabel = variation.direction === "up" ? "Aumento" : "Redução";
  return `${directionLabel} de ${cleanDeltaText} desde ${variation.previousYear}`;
}

export function EducacaoKpiCard({
  item,
  variant = "default",
  isActive = true,
  animateKey = "",
}) {
  const Icon = iconMap[item.key] ?? School;
  const VariationIcon = getVariationIcon(item.variation.direction);
  const isOverview = variant === "overview";
  const variationText = isOverview ? buildOverviewVariationText(item.variation) : item.variation.label;

  return (
    <article
      className={`educacao-kpi-card rounded-[24px] ${
        isOverview
          ? "flex h-full min-h-[214px] flex-col justify-between border border-[rgba(242,161,22,0.2)] bg-[#FDE7C2] p-6 shadow-[0_14px_32px_rgba(15,34,58,0.06)]"
          : "educacao-surface p-5"
      }`}
    >
      <div className={`flex items-start justify-between gap-4 ${isOverview ? "min-h-[58px]" : ""}`}>
        <div
          className={`grid place-items-center rounded-2xl ${
            isOverview
              ? "h-14 w-14 border border-[rgba(242,161,22,0.22)] bg-white text-[#F2A116]"
              : "bg-white/[0.08] text-white h-12 w-12"
          }`}
        >
          <Icon size={isOverview ? 28 : 24} strokeWidth={2.1} />
        </div>
        <span
          className={`inline-flex max-w-[190px] items-center gap-2 rounded-2xl px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.08em] ${getVariationClasses(item.variation.direction, isOverview)}`}
          title={variationText}
        >
          {VariationIcon ? <VariationIcon size={14} strokeWidth={2.2} /> : null}
          <span>{variationText}</span>
        </span>
      </div>

      <div className="mt-5">
        <p
          className={
            isOverview ? "text-sm font-semibold text-[#10213A]" : "text-sm font-semibold text-slate-300"
          }
        >
          {item.label}
        </p>
        <strong
          className={`mt-2 block font-extrabold leading-none tracking-tight ${
            isOverview ? "text-[1.85rem] text-[#10213A]" : "text-[1.95rem] text-white"
          }`}
        >
          {isOverview ? (
            <AnimatedCounter
              value={item.value}
              duration={1100}
              formatter={(value) => formatAnimatedValue(value, item.unit)}
              isActive={isActive}
              animateKey={animateKey}
            />
          ) : (
            item.valueText
          )}
        </strong>
      </div>

      <div className={isOverview ? "mt-4 space-y-2" : "mt-3"}>
        <p className={isOverview ? "text-xs leading-6 text-slate-700" : "text-xs leading-6 text-slate-400"}>
          {item.note}
        </p>
        {item.comparisonText ? (
          <p className="text-[11px] font-semibold text-slate-500">{item.comparisonText}</p>
        ) : null}
      </div>
    </article>
  );
}
