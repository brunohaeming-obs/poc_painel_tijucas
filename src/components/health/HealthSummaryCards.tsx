import { Activity, HeartPulse, ShieldCheck, Syringe, UsersRound } from "lucide-react";
import { brInteger, decimalNumber } from "../../shared/lib/formatters.js";

const icons = {
  procedimentos: Activity,
  coberturaAps: HeartPulse,
  coberturaAcs: UsersRound,
  saudeBucal: ShieldCheck,
  vacinasAtencao: Syringe,
};

function formatCardValue(value: number | string | null, unit?: string) {
  if (value == null) return "em implantação";
  if (typeof value === "string") return value;
  const formatted = unit === "%" ? decimalNumber.format(value) : brInteger.format(value);
  return unit === "%" ? `${formatted}%` : formatted;
}

type SummaryCard = {
  id: keyof typeof icons;
  label: string;
  value: number | string | null;
  unit?: string;
  note?: string;
  source?: string;
};

export function HealthSummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = icons[card.id] ?? Activity;
        return (
          <article key={card.id} className="rounded-[20px] border border-red-200 bg-[#FFEAE9] p-5 shadow-[0_14px_34px_rgba(236,65,55,0.10)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700">
                <Icon size={18} strokeWidth={2.4} />
              </span>
            </div>
            <strong className="mt-3 block text-2xl font-extrabold leading-none text-slate-950">
              {formatCardValue(card.value, card.unit)}
            </strong>
            <span className="mt-2 block text-xs font-semibold leading-5 text-slate-600">
              {card.unit && card.unit !== "%" ? card.unit : null}
              {card.unit && card.unit !== "%" && card.note ? " · " : null}
              {card.note}
            </span>
            <span className="mt-3 block text-[11px] font-bold text-slate-400">{card.source}</span>
          </article>
        );
      })}
    </div>
  );
}
