import type { ReactNode } from "react";

type HealthSectionCardProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
  narrativeTitle: string;
  narrative: string;
};

export function HealthSectionCard({
  title,
  subtitle,
  actions,
  children,
  narrativeTitle,
  narrative,
}: HealthSectionCardProps) {
  return (
    <section className="rounded-[28px] border border-red-200 bg-[#FFEAE9] p-5 shadow-[0_18px_45px_rgba(236,65,55,0.10)] md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-950">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          {children}
        </div>
        <aside className="rounded-[20px] border border-red-200 bg-white/70 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-700">{narrativeTitle}</p>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-700">{narrative}</p>
        </aside>
      </div>
    </section>
  );
}

export function HealthToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 rounded-xl border px-3 text-xs font-extrabold transition ${
        active
          ? "border-red-600 bg-[#EC4137] text-white"
          : "border-red-100 bg-white text-slate-700 hover:border-red-300 hover:text-red-700"
      }`}
    >
      {children}
    </button>
  );
}
