export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-start gap-5 px-6 py-4 md:px-10 2xl:px-12">
        <div className="flex min-w-[230px] items-center gap-3">
          <img
            src="/assets/brasao-tijucas.png"
            alt="Brasao de Tijucas"
            className="h-12 w-12 shrink-0 object-contain"
          />
          <div>
            <p className="text-xl font-extrabold tracking-normal text-brand-navy">Tijucas em Dados</p>
            <p className="text-sm font-medium text-brand-gray">Portal de Informacoes da Cidade</p>
          </div>
        </div>
      </div>
    </header>
  );
}
