import type { ComponentType, ReactNode } from "react";

type HealthSectionCardProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  eyebrowIcon?: ComponentType<{ size?: number; strokeWidth?: number }>;
  actions?: ReactNode;
  children: ReactNode;
  narrativeTitle?: string;
  narrativeHeadline?: string;
  narrative?: string;
  narrativeSource?: string;
  narrativeIcon?: ComponentType<{ size?: number; strokeWidth?: number }>;
  sidebarPosition?: "left" | "right";
};

export function HealthSectionCard({
  title,
  subtitle,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  actions,
  children,
  narrativeTitle,
  narrativeHeadline,
  narrative,
  narrativeSource,
  narrativeIcon: NarrativeIcon,
  sidebarPosition = "right",
}: HealthSectionCardProps) {
  const hasSidebar = Boolean(narrativeTitle && narrative);
  const gridClass = hasSidebar
    ? sidebarPosition === "left"
      ? "grid gap-8 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)] xl:items-start"
      : "grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)] xl:items-start"
    : "";

  const sidebar = hasSidebar ? (
    <aside className="flex flex-col justify-between border-l-2 border-red-300 pl-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#EC4137]">
          {NarrativeIcon && <NarrativeIcon size={12} strokeWidth={2.4} />}
          <span>{narrativeTitle}</span>
        </div>
        {narrativeHeadline && (
          <h3 className="mt-3 text-xl font-extrabold leading-tight text-slate-950">{narrativeHeadline}</h3>
        )}
        <p className="mt-4 text-sm leading-7 text-slate-600">{narrative}</p>
      </div>
      {narrativeSource && (
        <p className="mt-6 border-t border-red-100 pt-3 text-[11px] font-semibold text-slate-400">{narrativeSource}</p>
      )}
    </aside>
  ) : null;

  return (
    <section className="rounded-[28px] border border-red-200 bg-[#FFEAE9] p-5 shadow-[0_18px_45px_rgba(236,65,55,0.10)] md:p-6">
      <div className={gridClass}>
        {sidebarPosition === "left" && sidebar}
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              {eyebrow && (
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  {EyebrowIcon && <EyebrowIcon size={12} strokeWidth={2.4} />}
                  <span>{eyebrow}</span>
                </div>
              )}
              <h3 className="text-xl font-extrabold text-slate-950">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          {children}
        </div>
        {sidebarPosition === "right" && sidebar}
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
