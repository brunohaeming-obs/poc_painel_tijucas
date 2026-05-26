import { Search } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden rounded-card bg-brand-navy px-6 py-10 text-white shadow-soft md:px-10 md:py-12"
    >
      <img
        src="/assets/foto-bairro-tijucas.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.42)_52%,rgba(255,255,255,0.88)_100%)]" />
      <img
        src="/assets/logo-turismo-tijucas-2.png"
        alt="Turismo Tijucas"
        className="absolute right-8 top-1/2 hidden max-h-60 w-[min(36vw,440px)] -translate-y-1/2 object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.30)] lg:block"
      />

      <div className="relative max-w-3xl lg:max-w-[58%]">
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
