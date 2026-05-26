import { LocateFixed, Maximize2, Minus, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import brazilGeojsonRaw from "../data/ibgeBrasilEstados.geojson?raw";
import scGeojsonRaw from "../data/ibgeSantaCatarinaMunicipios.geojson?raw";

const brazilGeojson = JSON.parse(brazilGeojsonRaw.replace(/^\uFEFF/, ""));
const scGeojson = JSON.parse(scGeojsonRaw.replace(/^\uFEFF/, ""));

const tijucasCode = "4218004";
const santaCatarinaStateCode = "42";
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

const mapWidth = 760;
const mapHeight = 460;
const padding = 26;

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

const coordinates = collectCoordinates(brazilGeojson.features);
const longitudes = coordinates.map(([longitude]) => longitude);
const latitudes = coordinates.map(([, latitude]) => latitude);
const brazilBounds = {
  minLongitude: Math.min(...longitudes),
  maxLongitude: Math.max(...longitudes),
  minLatitude: Math.min(...latitudes),
  maxLatitude: Math.max(...latitudes),
};

const longitudeSpan = brazilBounds.maxLongitude - brazilBounds.minLongitude;
const latitudeSpan = brazilBounds.maxLatitude - brazilBounds.minLatitude;
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
    offsetX + (longitude - brazilBounds.minLongitude) * scale,
    offsetY + (brazilBounds.maxLatitude - latitude) * scale,
  ];
}

function ringToPath(ring) {
  return ring
    .map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ")
    .concat(" Z");
}

function featureToPath(feature) {
  return getRings(feature.geometry).map(ringToPath).join(" ");
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

function featuresBounds(features) {
  const bounds = features.map(featureBounds);

  return {
    minX: Math.min(...bounds.map((item) => item.minX)),
    maxX: Math.max(...bounds.map((item) => item.maxX)),
    minY: Math.min(...bounds.map((item) => item.minY)),
    maxY: Math.max(...bounds.map((item) => item.maxY)),
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

  return `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`;
}

function parseViewBox(viewBox) {
  return viewBox.split(" ").map(Number);
}

function viewBoxToString([x, y, width, height]) {
  return `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`;
}

function clampViewBox([x, y, width, height]) {
  const minWidth = 18;
  const maxWidth = mapWidth;
  const nextWidth = Math.min(maxWidth, Math.max(minWidth, width));
  const nextHeight = nextWidth * (mapHeight / mapWidth);
  const nextX = Math.min(mapWidth - nextWidth, Math.max(0, x));
  const nextY = Math.min(mapHeight - nextHeight, Math.max(0, y));

  return [nextX, nextY, nextWidth, nextHeight];
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

function municipalityStyle(code) {
  if (code === tijucasCode) {
    return {
      fill: "#71B434",
      stroke: "#000086",
      strokeWidth: 2.3,
    };
  }

  if (neighboringCodes.has(code)) {
    return {
      fill: "#BFD8C8",
      stroke: "#FFFFFF",
      strokeWidth: 0.9,
    };
  }

  return {
    fill: "#D9EAF7",
    stroke: "#FFFFFF",
    strokeWidth: 0.55,
  };
}

function stateStyle(code) {
  if (code === santaCatarinaStateCode) {
    return {
      fill: "#BFD8C8",
      stroke: "#000086",
      strokeWidth: 1.6,
    };
  }

  return {
    fill: "#E3ECF4",
    stroke: "#FFFFFF",
    strokeWidth: 0.9,
  };
}

export function MapCard() {
  const [mapMode, setMapMode] = useState("tijucas");
  const [manualViewBox, setManualViewBox] = useState(null);
  const svgRef = useRef(null);
  const tijucasFeature = scGeojson.features.find(
    (feature) => feature.properties.codarea === tijucasCode,
  );
  const tijucasRegionFeatures = scGeojson.features.filter((feature) => {
    const code = feature.properties.codarea;
    return code === tijucasCode || neighboringCodes.has(code);
  });
  const scBounds = useMemo(() => featuresBounds(scGeojson.features), []);
  const tijucasRegionBounds = useMemo(
    () => featuresBounds(tijucasRegionFeatures),
    [tijucasRegionFeatures],
  );
  const tijucasPosition = useMemo(() => labelPosition(tijucasFeature), [tijucasFeature]);

  const brazilViewBox = `0 0 ${mapWidth} ${mapHeight}`;
  const santaCatarinaViewBox = boundsToViewBox(scBounds, 26);
  const tijucasViewBox = boundsToViewBox(tijucasRegionBounds, 22);
  const currentViewBox =
    manualViewBox ??
    (mapMode === "brasil"
      ? brazilViewBox
      : mapMode === "sc"
        ? santaCatarinaViewBox
        : tijucasViewBox);

  function setMode(mode) {
    setManualViewBox(null);
    setMapMode(mode);
  }

  function handleWheel(event) {
    event.preventDefault();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const [x, y, width, height] = parseViewBox(currentViewBox);
    const pointerX = x + ((event.clientX - rect.left) / rect.width) * width;
    const pointerY = y + ((event.clientY - rect.top) / rect.height) * height;
    const zoomFactor = event.deltaY > 0 ? 1.18 : 0.84;
    const nextWidth = width * zoomFactor;
    const nextHeight = height * zoomFactor;
    const nextX = pointerX - ((pointerX - x) / width) * nextWidth;
    const nextY = pointerY - ((pointerY - y) / height) * nextHeight;

    setManualViewBox(viewBoxToString(clampViewBox([nextX, nextY, nextWidth, nextHeight])));
  }

  return (
    <article className="card flex min-h-[520px] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-brand-border px-6 py-5">
        <div>
          <h3 className="text-lg font-extrabold text-brand-navy">
            Mapa Brasil, SC e Tijucas
          </h3>
          <p className="text-sm font-medium text-brand-gray">
            Zoom inicial em Tijucas com contexto estadual e nacional
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-brand-green">
          {mapMode === "brasil" ? "Brasil" : mapMode === "sc" ? "Santa Catarina" : "Tijucas"}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-[#E7EEF5] p-4">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,127,254,0.08)_1px,transparent_1px),linear-gradient(rgba(0,127,254,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />

        <div className="absolute left-5 top-5 z-10 flex flex-col overflow-hidden rounded-lg border border-brand-border bg-white shadow-soft">
          <button
            className="grid h-9 w-9 place-items-center text-brand-navy transition hover:bg-brand-chip"
            type="button"
            aria-label="Aproximar Tijucas"
            onClick={() => setMode("tijucas")}
          >
            <Plus size={17} />
          </button>
          <button
            className="grid h-9 w-9 place-items-center border-t border-brand-border text-brand-navy transition hover:bg-brand-chip"
            type="button"
            aria-label="Ver Santa Catarina"
            onClick={() => setMode("sc")}
          >
            <Minus size={17} />
          </button>
          <button
            className="grid h-9 w-9 place-items-center border-t border-brand-border text-brand-navy transition hover:bg-brand-chip"
            type="button"
            aria-label="Ver Brasil"
            onClick={() => setMode("brasil")}
          >
            <Maximize2 size={16} />
          </button>
        </div>

        <div
          className="relative h-full max-h-[410px] min-h-[340px] w-full max-w-[820px]"
          onWheel={handleWheel}
        >
          <svg
            ref={svgRef}
            className="h-full w-full rounded-xl bg-white/85 shadow-soft"
            viewBox={currentViewBox}
            role="img"
            aria-label="Mapa do Brasil com zoom inicial em Tijucas, Santa Catarina"
          >
          <g>
            {brazilGeojson.features.map((feature) => {
              const code = feature.properties.codarea;
              const style = stateStyle(code);

              return (
                <path
                  key={`state-${code}`}
                  d={featureToPath(feature)}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          <g>
            {scGeojson.features.map((feature) => {
              const code = feature.properties.codarea;
              const style = municipalityStyle(code);

              return (
                <path
                  key={`municipality-${code}`}
                  d={featureToPath(feature)}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          <g>
            <circle
              cx={tijucasPosition.x}
              cy={tijucasPosition.y}
              r={mapMode === "brasil" ? 4.8 : mapMode === "sc" ? 2.4 : 1.2}
              fill="#F2A116"
              fillOpacity="0.15"
              stroke="#FFFFFF"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {mapMode === "sc" ? (
              <text
                x={tijucasPosition.x + 8}
                y={tijucasPosition.y - 7}
                fill="#000086"
                fontSize={6}
                fontWeight={800}
              >
                Tijucas
              </text>
            ) : null}
          </g>
          </svg>
        </div>

        <div className="absolute bottom-5 right-5 z-10 rounded-xl border border-brand-border bg-white/95 px-4 py-3 text-xs font-bold text-brand-gray shadow-soft">
          Fonte: IBGE - Malhas Geográficas
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-brand-gray">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-green" />
            Tijucas
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#BFD8C8]" />
            Santa Catarina
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#E3ECF4]" />
            Brasil
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-chip"
            type="button"
            onClick={() => setMode("tijucas")}
          >
            <LocateFixed size={16} />
            Tijucas
          </button>
          <button
            className="rounded-lg bg-brand-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy"
            type="button"
            onClick={() => setMode(mapMode === "brasil" ? "tijucas" : "brasil")}
          >
            {mapMode === "brasil" ? "Voltar para Tijucas" : "Ver Brasil"}
          </button>
        </div>
      </div>
    </article>
  );
}
