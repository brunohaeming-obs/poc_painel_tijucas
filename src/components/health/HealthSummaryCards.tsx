import { Activity, HeartPulse, Info, ShieldCheck, Syringe, UsersRound } from "lucide-react";
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
  help?: string;
};

function InfoMark({ text }: { text?: string }) {
  if (!text) return null;
  const paragraphs = text.split(/(?<=\.)\s+/).filter(Boolean);
  return (
    <span
      tabIndex={0}
      className="group relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-red-400/35 bg-red-500/[0.08] text-red-600 outline-none transition hover:border-red-500 hover:bg-red-500 hover:text-white focus:border-red-500 focus:bg-red-500 focus:text-white"
      aria-label="Mais informações"
    >
      <Info size={12} strokeWidth={2.6} />
      <span className="pointer-events-none absolute right-0 top-7 z-30 hidden w-[380px] max-w-[calc(100vw-32px)] rounded-2xl border border-red-200 bg-white p-5 text-left text-sm font-semibold leading-6 text-slate-700 shadow-2xl ring-1 ring-red-500/10 group-hover:block group-focus:block">
        <span className="mb-3 block text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">Como ler este indicador</span>
        {paragraphs.map((paragraph) => (
          <span key={paragraph} className="mt-3 block border-l-2 border-red-300/60 pl-3">
            {paragraph}
          </span>
        ))}
      </span>
    </span>
  );
}

export function HealthSummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = icons[card.id] ?? Activity;
        return (
          <article key={card.id} className="rounded-[20px] border border-red-200 bg-[#FFEAE9] p-5 shadow-[0_14px_34px_rgba(236,65,55,0.10)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
              <div className="flex shrink-0 items-center gap-2">
                <InfoMark text={card.help} />
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-700">
                  <Icon size={18} strokeWidth={2.4} />
                </span>
              </div>
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
