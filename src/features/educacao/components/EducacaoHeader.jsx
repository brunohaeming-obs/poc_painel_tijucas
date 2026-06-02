import { GraduationCap } from "lucide-react";
import { EducacaoFilters } from "./EducacaoFilters.jsx";

export function EducacaoHeader({ selectedYear, availableYears, onYearChange }) {
  return (
    <header className="educacao-surface-strong relative overflow-visible rounded-[30px] p-6 md:p-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
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
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
            Retrato da rede escolar, atendimento, infraestrutura e território da educação
            básica.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              Série anual de 2014 a 2025
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              Leitura guiada por textos locais
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
              Sem inferência de IDEB ou fluxo escolar
            </span>
          </div>
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
