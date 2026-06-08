import { useMemo } from "react";
import { MapPinned, TableProperties } from "lucide-react";
import tijucasRegionGeojsonRaw from "../../../data/geo/ibgeTijucasRegion.geojson?raw";
import { territoryModes } from "../config/educacaoIndicators.js";
import { EducacaoNarrativeText } from "./EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";
import { EscolasMapCard } from "./EscolasMapCard.jsx";

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

function parseGeoJsonSafely(raw) {
  try {
    if (!raw || typeof raw !== "string") {
      return null;
    }

    const cleaned = raw.replace(/^﻿/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    console.warn(
      "Não foi possível ler o GeoJSON de Tijucas. O contorno municipal será omitido.",
      error,
    );
    return null;
  }
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function getMunicipalFeature(featureCollection) {
  return (
    featureCollection?.features?.find((feature) => {
      const properties = feature.properties ?? {};
      return (
        properties.id === "4218004" ||
        properties.codarea === "4218004" ||
        normalizeText(properties.name) === "tijucas"
      );
    }) ?? null
  );
}

const tijucasRegionGeojson = parseGeoJsonSafely(tijucasRegionGeojsonRaw);
const municipalFeature = tijucasRegionGeojson ? getMunicipalFeature(tijucasRegionGeojson) : null;

export function TerritorioSection({
  selectedYear,
  territoryData,
  territoryMode,
  onModeChange,
  narratives,
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
    },
  };

  const schoolPoints = useMemo(
    () =>
      (safeTerritoryData.points ?? []).filter(
        (point) => Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)),
      ),
    [safeTerritoryData.points],
  );

  return (
    <section className="grid gap-8" aria-labelledby="educacao-territorio-title">
      <EducacaoSectionHeader
        titleId="educacao-territorio-title"
        eyebrow="Território / mapa"
        title="Distribuição territorial da rede escolar"
      />

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <div className="space-y-6">
          <article className="educacao-surface rounded-[28px] p-6">
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
                  Base cartográfica do OpenStreetMap, com o contorno municipal de Tijucas e os
                  pontos das escolas com coordenadas disponíveis.
                </p>
              </div>

              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
                {territoryModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => onModeChange(mode.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      territoryMode === mode.value
                        ? "bg-brand-yellow text-brand-navy"
                        : "text-slate-200 hover:bg-white/[0.08]"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {territoryMode === "schools" && safeTerritoryData.available && schoolPoints.length ? (
              <EscolasMapCard
                points={schoolPoints}
                boundary={municipalFeature}
                height={360}
                ariaLabel={`Rede escolar de Tijucas com escolas em ${selectedYear}`}
              />
            ) : null}

            {territoryMode === "enrollments" ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-6">
                {/* Futuro: substituir este bloco por heatmap de bairros quando houver GeoJSON e matrículas territorializadas por escola ou bairro. */}
                <p className="text-lg font-bold text-white">Mapa de matrículas em preparação</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  A base atual não traz matrículas por escola ou por bairro com chave
                  territorial segura. Sem esse vínculo, o painel não distribui matrículas no mapa.
                </p>
              </div>
            ) : null}

            {!safeTerritoryData.available ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-6">
                <p className="text-lg font-bold text-white">
                  Distribuição territorial indisponível para {selectedYear}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  A base com coordenadas está disponível apenas para{" "}
                  {safeTerritoryData.availableYears.join(", ") || "anos futuros"}.
                </p>
              </div>
            ) : null}

            {safeTerritoryData.available && territoryMode === "schools" && !schoolPoints.length ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-6">
                <p className="text-lg font-bold text-white">
                  Nenhuma escola com coordenadas após os filtros
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Ajuste dependência, localização ou etapa para ampliar o recorte territorial.
                </p>
              </div>
            ) : null}

            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
              <p>
                O mapa representa a distribuição territorial das unidades da rede de educação
                básica de Tijucas e não representa desempenho das escolas.
              </p>
              <p>
                Malha territorial de bairros não encontrada. Para ativar mapa de calor por
                bairro, incluir <code>public/data/geo/tijucas_bairros.geojson</code>.
              </p>
            </div>
          </article>

          <EducacaoNarrativeText
            eyebrow="Território"
            title="Distribuição da rede, não ranking"
            body={narratives.territory}
            icon={MapPinned}
          />
        </div>

        <article className="educacao-surface rounded-[28px] p-6">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            <TableProperties size={16} />
            Tabela por bairro
          </div>
          <h3 className="mt-4 text-xl font-extrabold text-white">
            Escolas por bairro em {selectedYear}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            A base atual permite contar escolas por bairro. As matrículas seguem como N/D
            porque a base final publicada não traz vínculo por escola com segurança.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-semibold">Bairro</th>
                  <th className="pb-3 font-semibold">Escolas</th>
                  <th className="pb-3 font-semibold">Matrículas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {safeTerritoryData.neighborhoodRows.length ? (
                  safeTerritoryData.neighborhoodRows.map((row) => (
                    <tr key={row.bairro}>
                      <td className="py-3 text-slate-100">{row.bairro}</td>
                      <td className="py-3 font-bold text-white">{integerFormatter.format(row.escolas)}</td>
                      <td className="py-3 text-slate-300">
                        {row.matriculas === null ? "N/D" : integerFormatter.format(row.matriculas)}
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
