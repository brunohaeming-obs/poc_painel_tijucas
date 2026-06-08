import { TableProperties } from "lucide-react";
import { EducacaoSchoolsMapCard } from "./EducacaoSchoolsMapCard.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export function TerritorioSection({
  selectedYear,
  territoryData,
}) {
  const safeTerritoryData = {
    available: Boolean(territoryData?.available),
    availableYears: territoryData?.availableYears ?? [],
    points: territoryData?.points ?? [],
    neighborhoodRows: territoryData?.neighborhoodRows ?? [],
    summary: {
      schools: territoryData?.summary?.schools ?? 0,
      neighborhoods: territoryData?.summary?.neighborhoods ?? 0,
      withCoordinates: territoryData?.summary?.withCoordinates ?? 0,
      urban: territoryData?.summary?.urban ?? 0,
      rural: territoryData?.summary?.rural ?? 0,
      enrollments: territoryData?.summary?.enrollments ?? 0,
      hasEnrollmentsByNeighborhood: Boolean(
        territoryData?.summary?.hasEnrollmentsByNeighborhood,
      ),
    },
  };

  const neighborhoodTableTitle = safeTerritoryData.summary.hasEnrollmentsByNeighborhood
    ? `Escolas e matrículas por bairro em ${selectedYear}`
    : `Escolas por bairro em ${selectedYear}`;
  const neighborhoodTableDescription = safeTerritoryData.summary.hasEnrollmentsByNeighborhood
    ? `A tabela mostra escolas e matrículas por bairro em ${selectedYear}. As matrículas foram agregadas a partir do vínculo entre escola, bairro e código da entidade escolar.`
    : "A base atual permite contar escolas por bairro. Matrículas por bairro dependem de vínculo entre escola e matrícula, ainda não disponível nesta versão.";

  return (
    <section className="grid gap-8" aria-labelledby="educacao-territorio-title">
      <EducacaoSectionHeader
        titleId="educacao-territorio-title"
        eyebrow="Território / mapa"
        title="Distribuição territorial da rede escolar"
      />

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
        <div className="space-y-6">
          <article className="educacao-surface h-full rounded-[28px] p-6">
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {safeTerritoryData.summary.schools} escolas filtradas
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {safeTerritoryData.summary.neighborhoods} bairros
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {safeTerritoryData.summary.withCoordinates} pontos com coordenadas
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {safeTerritoryData.summary.urban} urbanas / {safeTerritoryData.summary.rural} rurais
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">Mapa da rede escolar</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  O mapa mostra as escolas com coordenadas disponíveis na base do Censo Escolar.
                </p>
              </div>
            </div>

            {safeTerritoryData.available ? (
              <div className="mt-6">
                <EducacaoSchoolsMapCard
                  points={safeTerritoryData.points}
                  title="Escolas no território"
                  subtitle="Pontos com coordenadas disponíveis na base"
                  height={380}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-6">
                <p className="text-lg font-bold text-white">
                  Distribuição territorial indisponível para {selectedYear}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  A base com coordenadas está disponível apenas para{" "}
                  {safeTerritoryData.availableYears.join(", ") || "anos futuros"}.
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
              <p>
                O mapa mostra a distribuição territorial das escolas com coordenadas disponíveis.
                Unidades sem latitude/longitude permanecem na tabela, mas não aparecem no mapa.
              </p>
            </div>
          </article>
        </div>

        <article className="educacao-surface flex h-full flex-col rounded-[28px] p-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            <TableProperties size={16} />
            Tabela por bairro
          </div>
          <h3 className="mt-4 text-xl font-extrabold text-white">{neighborhoodTableTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{neighborhoodTableDescription}</p>

          <div className="mt-6 min-h-0 flex-1 overflow-auto pr-1">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-semibold">Bairro</th>
                  <th className="pb-3 text-right font-semibold">Escolas</th>
                  <th className="pb-3 text-right font-semibold">Matrículas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {safeTerritoryData.neighborhoodRows.length ? (
                  safeTerritoryData.neighborhoodRows.map((row) => (
                    <tr key={row.bairro}>
                      <td className="py-3 text-slate-100">{row.bairro}</td>
                      <td className="py-3 text-right font-bold text-white">
                        {integerFormatter.format(row.escolas)}
                      </td>
                      <td className="py-3 text-right text-slate-300">
                        {row.matriculas === null || row.matriculas === undefined
                          ? "N/D"
                          : integerFormatter.format(row.matriculas)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-slate-300" colSpan="3">
                      Nenhum bairro encontrado para o recorte atual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
