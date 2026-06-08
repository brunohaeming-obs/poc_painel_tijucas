export function EducacaoFilters({ selectedYear, availableYears, onYearChange }) {
  return (
    <div className="educacao-surface rounded-[26px] p-5 xl:self-start">
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-slate-100">Ano de referência</span>
        <select
          className="educacao-year-select h-12 w-full rounded-2xl border border-white/12 bg-white/[0.08] px-4 pr-10 text-sm font-medium text-slate-100"
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        O ano de referência atualiza os indicadores de fotografia do município. As
        séries históricas permanecem completas para preservar a leitura da evolução ao
        longo do tempo.
      </p>
    </div>
  );
}
