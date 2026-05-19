export function ThemeSelector({ themes, selectedTheme }) {
  return (
    <section aria-labelledby="temas-title">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="temas-title" className="text-xl font-extrabold text-brand-navy">
            Painéis por tema
          </h2>
          <p className="text-sm font-medium text-brand-gray">
            Selecione uma área para explorar indicadores relacionados.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {themes.map((theme) => {
          const selected = theme === selectedTheme;
          return (
            <button
              className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                selected
                  ? "bg-brand-chipActive text-brand-navy shadow-sm"
                  : "bg-brand-chip text-slate-700 hover:bg-brand-chipActive"
              }`}
              key={theme}
              type="button"
              aria-pressed={selected}
            >
              {theme}
            </button>
          );
        })}
      </div>
    </section>
  );
}
