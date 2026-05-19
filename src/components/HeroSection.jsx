import { Search } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden rounded-card bg-brand-navy px-6 py-10 text-white shadow-soft md:px-10 md:py-12"
    >
      <img
        src="/assets/dinossauro.jfif"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.70]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(46,125,79,0.22),transparent_28%),linear-gradient(135deg,rgba(0,59,115,0.46)_0%,rgba(0,94,168,0.36)_58%,rgba(46,125,79,0.32)_100%)]" />
      <div className="absolute right-6 top-7 hidden h-44 w-80 rounded-[38px] border border-white/15 bg-white/10 md:block" />
      <div className="absolute bottom-0 right-12 hidden h-24 w-64 rounded-t-[32px] border border-white/15 bg-white/10 lg:block" />

      <div className="relative max-w-3xl">
        <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
          Observatório municipal
        </span>
        <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-normal md:text-5xl">
          Tijucas em dados de forma simples e transparente
        </h1>
        <div className="mt-7 flex max-w-2xl items-center gap-3 rounded-card bg-white p-3 shadow-soft">
          <Search className="ml-2 shrink-0 text-brand-blue" size={22} />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-slate-800 placeholder:text-slate-500 focus:outline-none"
            placeholder="Buscar indicador, serviço ou tema"
            type="search"
          />
          <button className="rounded-lg bg-brand-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy">
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}
