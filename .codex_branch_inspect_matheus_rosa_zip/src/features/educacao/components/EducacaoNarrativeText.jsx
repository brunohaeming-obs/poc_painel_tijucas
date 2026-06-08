export function EducacaoNarrativeText({
  eyebrow,
  title,
  body,
  bodyContent,
  caption,
  icon: Icon,
  className = "",
}) {
  return (
    <div className={`max-w-[62ch] border-l border-white/16 pl-5 ${className}`.trim()}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
        {Icon ? <Icon size={14} /> : null}
        {eyebrow}
      </div>
      <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white">{title}</h3>
      {bodyContent ?? <p className="mt-4 text-base leading-8 text-slate-100">{body}</p>}
      {caption ? <p className="mt-4 text-sm leading-6 text-slate-400">{caption}</p> : null}
    </div>
  );
}
