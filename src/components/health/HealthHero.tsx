type HealthHeroProps = {
  title: string;
  subtitle: string;
};

export function HealthHero({ title, subtitle }: HealthHeroProps) {
  return (
    <header className="rounded-[28px] border border-red-200 bg-[#FFEAE9] px-6 py-7 shadow-[0_18px_45px_rgba(236,65,55,0.10)] md:px-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-700">Eixo saúde</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-5xl text-base font-medium leading-7 text-slate-600">{subtitle}</p>
    </header>
  );
}
