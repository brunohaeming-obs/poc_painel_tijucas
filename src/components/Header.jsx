import { Search } from "lucide-react";

const menuItems = ["Início", "Indicadores", "Transparência", "Boletins"];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-5 px-6 py-4 md:px-10 2xl:px-12">
        <div className="flex min-w-[230px] items-center gap-3">
          <img
            src="/assets/brasao-tijucas.png"
            alt="Brasão de Tijucas"
            className="h-12 w-12 shrink-0 object-contain"
          />
          <div>
            <p className="text-xl font-extrabold tracking-normal text-brand-navy">
              Tijucas em Dados
            </p>
            <p className="text-sm font-medium text-brand-gray">
              Portal de Informações da Cidade
            </p>
          </div>
        </div>

        <nav
          className="hidden items-center gap-1 rounded-full bg-brand-chip p-1 lg:flex"
          aria-label="Menu principal"
        >
          {menuItems.map((item) => (
            <a
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-brand-blue"
              href="#inicio"
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-brand-border bg-white text-brand-blue shadow-sm transition hover:bg-brand-chip"
          aria-label="Buscar"
        >
          <Search size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
