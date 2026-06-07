export function EducacaoChartCard({ title, subtitle, actions, children, className = "" }) {
  return (
    <article className={`educacao-surface educacao-chart-card rounded-[28px] p-5 ${className}`.trim()}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h3 className="text-xl font-extrabold text-white">{title}</h3>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </article>
  );
}
