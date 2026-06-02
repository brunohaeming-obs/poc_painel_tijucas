export function EducacaoSectionHeader({ eyebrow, title, badge, description, titleId }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
          {eyebrow}
        </p>
        <h2 id={titleId} className="mt-2 text-3xl font-extrabold tracking-tight text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        ) : null}
      </div>

      {badge ? (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
