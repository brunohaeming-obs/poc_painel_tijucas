import { useMemo, useState } from "react";
import { MapPinned, TableProperties } from "lucide-react";
import tijucasRegionGeojsonRaw from "../../../data/geo/ibgeTijucasRegion.geojson?raw";
import { territoryModes } from "../config/educacaoIndicators.js";
import { EducacaoNarrativeText } from "./EducacaoNarrativeText.jsx";
import { EducacaoSectionHeader } from "./EducacaoSectionHeader.jsx";

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});
const SVG_WIDTH = 620;
const SVG_HEIGHT = 360;
const SVG_PADDING = 36;

function parseGeoJsonSafely(raw) {
  try {
    if (!raw || typeof raw !== "string") {
      return null;
    }

    const cleaned = raw.replace(/^\uFEFF/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    console.warn(
      "Não foi possível ler o GeoJSON de Tijucas. O mapa será exibido em modo fallback.",
      error,
    );
    return null;
  }
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

function getRingsFromGeometry(geometry) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates ?? [];
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates ?? []).flat();
  }

  return [];
}

function getBounds(rings) {
  const coordinates = rings.flat();
  if (!coordinates.length) {
    return null;
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);

  return {
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
  };
}

function createProjector(bounds) {
  if (!bounds) {
    return null;
  }

  const longitudeSpan = bounds.maxLongitude - bounds.minLongitude || 1;
  const latitudeSpan = bounds.maxLatitude - bounds.minLatitude || 1;
  const scale = Math.min(
    (SVG_WIDTH - SVG_PADDING * 2) / longitudeSpan,
    (SVG_HEIGHT - SVG_PADDING * 2) / latitudeSpan,
  );
  const offsetX = (SVG_WIDTH - longitudeSpan * scale) / 2;
  const offsetY = (SVG_HEIGHT - latitudeSpan * scale) / 2;

  return ([longitude, latitude]) => ({
    x: offsetX + (longitude - bounds.minLongitude) * scale,
    y: SVG_HEIGHT - offsetY - (latitude - bounds.minLatitude) * scale,
  });
}

function buildPathData(rings, project) {
  return rings
    .map((ring) =>
      ring
        .map(([longitude, latitude], index) => {
          const point = project([longitude, latitude]);
          return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
        })
        .join(" "),
    )
    .map((path) => `${path} Z`)
    .join(" ");
}

function projectSchoolPoints(points, project) {
  if (!project) {
    return [];
  }

  return points.map((point) => ({
    ...point,
    ...project([point.longitude, point.latitude]),
  }));
}

const tijucasRegionGeojson = parseGeoJsonSafely(tijucasRegionGeojsonRaw);
const municipalFeature = tijucasRegionGeojson ? getMunicipalFeature(tijucasRegionGeojson) : null;
const municipalRings = municipalFeature?.geometry ? getRingsFromGeometry(municipalFeature.geometry) : [];
const municipalBounds = municipalRings.length ? getBounds(municipalRings) : null;
const projectMunicipalCoordinate = municipalBounds ? createProjector(municipalBounds) : null;
const municipalPathData =
  municipalRings.length && projectMunicipalCoordinate
    ? buildPathData(municipalRings, projectMunicipalCoordinate)
    : "";

export function TerritorioSection({
  selectedYear,
  territoryData,
  territoryMode,
  onModeChange,
  narratives,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
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

  const projectedPoints = useMemo(
    () =>
      safeTerritoryData.available && projectMunicipalCoordinate
        ? projectSchoolPoints(safeTerritoryData.points ?? [], projectMunicipalCoordinate)
        : [],
    [safeTerritoryData.available, safeTerritoryData.points],
  );
  const hasMunicipalOutline = Boolean(municipalPathData);

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
                  O recorte usa o limite municipal de Tijucas e os pontos das escolas com
                  coordenadas disponíveis.
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

            {territoryMode === "schools" && safeTerritoryData.available && hasMunicipalOutline ? (
              <div className="relative mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
                <svg
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="h-[360px] w-full"
                  role="img"
                  aria-label={`Limite municipal de Tijucas com escolas em ${selectedYear}`}
                >
                  <defs>
                    <linearGradient id="municipal-fill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(0,127,254,0.32)" />
                      <stop offset="100%" stopColor="rgba(252,212,24,0.12)" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width={SVG_WIDTH}
                    height={SVG_HEIGHT}
                    fill="rgba(3, 16, 61, 0.55)"
                  />
                  <path
                    d={municipalPathData}
                    fill="url(#municipal-fill)"
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth="2.2"
                  />
                  {projectedPoints.map((point) => (
                    <g key={point.co_entidade}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        fill="transparent"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle cx={point.x} cy={point.y} r="10" fill="rgba(0,127,254,0.16)" />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4.8"
                        fill="#FCD418"
                        stroke="#FFFFFF"
                        strokeWidth="1.1"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                  <text x="48" y="42" fill="#F8FBFF" fontSize="13" fontWeight="700">
                    Limite municipal de Tijucas
                  </text>
                </svg>

                {hoveredPoint ? (
                  <div
                    className="pointer-events-none absolute z-10 w-[220px] rounded-2xl border border-white/10 bg-[#071845]/95 px-4 py-3 text-sm text-white shadow-lg"
                    style={{
                      left: `${Math.min((hoveredPoint.x / SVG_WIDTH) * 100 + 3, 82)}%`,
                      top: `${Math.max((hoveredPoint.y / SVG_HEIGHT) * 100 - 4, 8)}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <strong className="block text-sm">{hoveredPoint.nome_escola}</strong>
                    <div className="mt-2 space-y-1 text-xs leading-5 text-slate-200">
                      <p>
                        <span className="text-slate-400">Bairro:</span> {hoveredPoint.bairro || "Não informado"}
                      </p>
                      {hoveredPoint.dependencia_administrativa ? (
                        <p>
                          <span className="text-slate-400">Dependência:</span>{" "}
                          {hoveredPoint.dependencia_administrativa}
                        </p>
                      ) : null}
                      {hoveredPoint.localizacao ? (
                        <p>
                          <span className="text-slate-400">Localização:</span> {hoveredPoint.localizacao}
                        </p>
                      ) : null}
                      {hoveredPoint.matriculas != null ? (
                        <p>
                          <span className="text-slate-400">Matrículas:</span>{" "}
                          {integerFormatter.format(hoveredPoint.matriculas)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
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

            {safeTerritoryData.available && territoryMode === "schools" && !hasMunicipalOutline ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-6">
                <p className="text-lg font-bold text-white">Limite municipal não encontrado no projeto</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Para ativar o mapa territorial com contorno municipal, inclua o GeoJSON
                  de Tijucas em <code>public/data/geo/</code> ou mantenha a malha municipal
                  disponível em <code>src/data/</code>.
                </p>
              </div>
            ) : null}

            {safeTerritoryData.available &&
            territoryMode === "schools" &&
            hasMunicipalOutline &&
            !projectedPoints.length ? (
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
