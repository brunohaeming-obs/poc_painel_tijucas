const footerLinks = [
  "Ouvidoria",
  "Lei de Acesso à Informação",
  "Dados Abertos",
  "Contato",
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-brand-border bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-10 2xl:px-12">
        <div>
          <p className="font-extrabold text-brand-navy">Tijucas em Dados</p>
          <p className="text-sm font-medium text-brand-gray">
            Última atualização: 11/05/2026 10:30
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold" aria-label="Links do rodapé">
          {footerLinks.map((link) => (
            <a className="text-brand-blue hover:text-brand-navy" href="#inicio" key={link}>
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
