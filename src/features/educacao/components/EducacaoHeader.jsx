import { GraduationCap } from "lucide-react";
import { EducacaoFilters } from "./EducacaoFilters.jsx";

export function EducacaoHeader({ selectedYear, availableYears, onYearChange }) {
  return (
    <header className="educacao-surface-strong relative overflow-visible rounded-[30px] px-6 py-5 md:px-7 md:py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.1] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.2em] text-slate-50">
            <GraduationCap size={20} strokeWidth={2.1} />
            Censo Escolar / INEP
          </span>
          <h2
            id="educacao-title"
            className="mt-5 text-3xl font-extrabold tracking-tight text-white md:text-5xl"
          >
            Educação em Tijucas
          </h2>
          <p className="mt-3 text-lg leading-7 text-slate-200 md:max-w-none md:whitespace-nowrap">
            Retrato da rede escolar, atendimento, infraestrutura e território da educação
            básica.
          </p>
        </div>

        <EducacaoFilters
          selectedYear={selectedYear}
          availableYears={availableYears}
          onYearChange={onYearChange}
        />
      </div>
    </header>
  );
}
