import { Maximize2, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import scGeojsonRaw from "../data/ibgeSantaCatarinaMunicipios.geojson?raw";
import municipalityNamesRaw from "../data/ibgeScMunicipioNames.json?raw";

const scGeojson = JSON.parse(scGeojsonRaw.replace(/^\uFEFF/, ""));
const municipalityNames = JSON.parse(municipalityNamesRaw.replace(/^\uFEFF/, ""));

const tijucasCode = "4218004";
const neighboringCodes = new Set([
  "4202305",
  "4202909",
  "4203204",
  "4203709",
  "4206009",
  "4208302",
  "4211504",
  "4213500",
  "4216305",
]);

const labeledCodes = new Set([
  tijucasCode,
  "4203709",
  "4213500",
  "4208302",
  "4202909",
  "4202305",
]);

const mapWidth = 560;
const mapHeight = 340;
const padding = 18;

function getRings(geometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates;
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat();
  }

  return [];
}

function collectCoordinates(features) {
  return features.flatMap((feature) =>
    getRings(feature.geometry).flatMap((ring) => ring),
  );
}

const coordinates = collectCoordinates(scGeojson.features);
const longitudes = coordinates.map(([longitude]) => longitude);
const latitudes = coordinates.map(([, latitude]) => latitude);
const bounds = {
  minLongitude: Math.min(...longitudes),
  maxLongitude: Math.max(...longitudes),
  minLatitude: Math.min(...latitudes),
  maxLatitude: Math.max(...latitudes),
};

const longitudeSpan = bounds.maxLongitude - bounds.minLongitude;
const latitudeSpan = bounds.maxLatitude - bounds.minLatitude;
const scale = Math.min(
  (mapWidth - padding * 2) / longitudeSpan,
  (mapHeight - padding * 2) / latitudeSpan,
);
const drawingWidth = longitudeSpan * scale;
const drawingHeight = latitudeSpan * scale;
const offsetX = (mapWidth - drawingWidth) / 2;
const offsetY = (mapHeight - drawingHeight) / 2;

function project([longitude, latitude]) {
  return [
    offsetX + (longitude - bounds.minLongitude) * scale,
    offsetY + (bounds.maxLatitude - latitude) * scale,
  ];
}

function ringToPath(ring) {
  return ring
    .map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ")
    .concat(" Z");
}

function featureToPath(feature) {
  return getRings(feature.geometry).map(ringToPath).join(" ");
}

function labelPosition(feature) {
  const ring = getRings(feature.geometry)[0] ?? [];
  const projected = ring.map(project);
  const total = projected.reduce(
    (acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / projected.length,
    y: total.y / projected.length,
  };
}

function featureStyle(code) {
  if (code === tijucasCode) {
    return {
      fill: "#2E7D4F",
      stroke: "#003B73",
      strokeWidth: 2.4,
    };
  }

  if (neighboringCodes.has(code)) {
    return {
      fill: "#BFD8C8",
      stroke: "#FFFFFF",
      strokeWidth: 1,
    };
  }

  return {
    fill: "#D9EAF7",
    stroke: "#FFFFFF",
    strokeWidth: 0.75,
  };
}

function featureBounds(feature) {
  const projected = getRings(feature.geometry).flatMap((ring) => ring.map(project));
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function boundsToViewBox(boundsToUse, extraPadding) {
  const x = Math.max(0, boundsToUse.minX - extraPadding);
  const y = Math.max(0, boundsToUse.minY - extraPadding);
  const width = Math.min(
    mapWidth - x,
    boundsToUse.maxX - boundsToUse.minX + extraPadding * 2,
  );
  const height = Math.min(
    mapHeight - y,
    boundsToUse.maxY - boundsToUse.minY + extraPadding * 2,
  );

  return `${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`;
}

export function MapCard() {
  const [mapMode, setMapMode] = useState("tijucas");
  const tijucasFeature = scGeojson.features.find(
    (feature) => feature.properties.codarea === tijucasCode,
  );
  const tijucasPosition = useMemo(() => labelPosition(tijucasFeature), [tijucasFeature]);
  const tijucasBounds = useMemo(() => featureBounds(tijucasFeature), [tijucasFeature]);
  const fullViewBox = `0 0 ${mapWidth} ${mapHeight}`;
  const tijucasViewBox = boundsToViewBox(tijucasBounds, 34);
  const regionalViewBox = boundsToViewBox(tijucasBounds, 78);
  const currentViewBox =
    mapMode === "full"
      ? fullViewBox
      : mapMode === "regional"
        ? regionalViewBox
        : tijucasViewBox;

  return (
    <article className="card flex min-h-[440px] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-brand-border px-6 py-5">
        <div>
          <h3 className="text-lg font-extrabold text-brand-navy">
            Mapa de Tijucas
          </h3>
          <p className="text-sm font-medium text-brand-gray">
            Malha de SC com abertura aproximada em Tijucas
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-brand-green">
          Zoom em Tijucas
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-[#E7EEF5] p-4">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,94,168,0.08)_1px,transparent_1px),linear-gradient(rgba(0,94,168,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="absolute left-5 top-5 z-10 flex flex-col overflow-hidden rounded-lg border border-brand-border bg-white shadow-soft">
          <button
            className="grid h-9 w-9 place-items-center text-brand-navy transition hover:bg-brand-chip"
            type="button"
            aria-label="Aproximar Tijucas"
            onClick={() => setMapMode("tijucas")}
          >
            <Plus size={17} />
          </button>
          <button
            className="grid h-9 w-9 place-items-center border-t border-brand-border text-brand-navy transition hover:bg-brand-chip"
            type="button"
            aria-label="Ver entorno de Tijucas"
            onClick={() => setMapMode("regional")}
          >
            <Minus size={17} />
          </button>
          <button
            className="grid h-9 w-9 place-items-center border-t border-brand-border text-brand-navy transition hover:bg-brand-chip"
            type="button"
            aria-label="Ver Santa Catarina completa"
            onClick={() => setMapMode("full")}
          >
            <Maximize2 size={16} />
          </button>
        </div>
        <svg
          className="relative h-full max-h-[330px] min-h-[280px] w-full max-w-[560px] rounded-xl bg-white/80"
          viewBox={currentViewBox}
          role="img"
          aria-label="Mapa de Santa Catarina com zoom inicial em Tijucas"
        >
          <defs>
            <filter id="scMapShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#003B73" floodOpacity="0.12" />
            </filter>
          </defs>

          <rect x="8" y="8" width="544" height="324" rx="24" fill="#FFFFFF" filter="url(#scMapShadow)" />
          <g>
            {scGeojson.features.map((feature) => {
              const code = feature.properties.codarea;
              const style = featureStyle(code);

              return (
                <path
                  key={code}
                  d={featureToPath(feature)}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          {mapMode !== "tijucas" &&
            scGeojson.features
            .filter((feature) => labeledCodes.has(feature.properties.codarea))
            .map((feature) => {
              const code = feature.properties.codarea;
              const position = labelPosition(feature);
              const isTijucas = code === tijucasCode;

              return (
                <text
                  key={`label-${code}`}
                  x={position.x}
                  y={position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isTijucas ? "#FFFFFF" : "#374151"}
                  fontSize={isTijucas ? 13 : 8.5}
                  fontWeight={isTijucas ? 800 : 700}
                >
                  {municipalityNames[code]}
                </text>
              );
            })}

          <g>
            <circle
              cx={tijucasPosition.x}
              cy={tijucasPosition.y + 16}
              r="4.5"
              fill="#F2A900"
              stroke="#FFFFFF"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
        <div className="absolute bottom-5 right-5 z-10 rounded-xl border border-brand-border bg-white/95 px-4 py-3 text-xs font-bold text-brand-gray shadow-soft">
          Fonte: IBGE - Malhas Geográficas v3
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-3 text-xs font-bold text-brand-gray">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-green" />
            Tijucas
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#BFD8C8]" />
            Vizinhos
          </span>
        </div>
        <button
          className="rounded-lg bg-brand-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy"
          type="button"
          onClick={() => setMapMode(mapMode === "full" ? "tijucas" : "full")}
        >
          {mapMode === "full" ? "Voltar para Tijucas" : "Ver mapa completo"}
        </button>
      </div>
    </article>
  );
}
