export function KpiCard({ icon: Icon, label, value, variation }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-blue">
          <Icon size={22} strokeWidth={2} />
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-brand-green">
          {variation}
        </span>
      </div>
      <p className="mt-5 text-sm font-semibold text-brand-gray">{label}</p>
      <strong className="mt-1 block text-2xl font-extrabold tracking-normal text-brand-navy">
        {value}
      </strong>
    </article>
  );
}
