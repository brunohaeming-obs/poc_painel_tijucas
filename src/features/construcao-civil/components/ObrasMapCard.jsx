import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

const GEOJSON_PATH = "/data/construcao/obras_tijucas.geojson";

const palette = {
  navy: "#000086",
  blue: "#007FFE",
  orange: "#F2A116",
};

const nf = new Intl.NumberFormat("pt-BR");

const METRICS = {
  count: { key: "obras_proximidade", label: "Contagem", unit: "obra(s)" },
  area: { key: "area_total_sum", label: "Metragem", unit: "m²" },
};

// ─── Ajuste fácil do tamanho/contraste das bolas ───────────────────────────
// min/max: raio (px) das menores e das maiores bolas.
// contrast: expoente da escala. 1 = linear; > 1 aumenta o contraste (pequenas
//           ficam menores e grandes maiores); < 1 (ex.: 0.5 = raiz quadrada)
//           reduz o contraste.
const MARKER_RADIUS = {
  min: 5,
  max: 50,
  contrast: 1.8,
};

// Enquadramento padrão: foca os setores que concentram a maior parte das obras
// (núcleo central). `share` = fração das obras a cobrir; `maxZoom` limita a
// aproximação; `padding` é a folga (px) ao redor.
const FOCUS = {
  share: 0.7,
  maxZoom: 16,
  padding: 28,
};
// ───────────────────────────────────────────────────────────────────────────

function setorStyle() {
  return {
    color: palette.blue,
    weight: 1,
    fillColor: palette.blue,
    fillOpacity: 0.08,
  };
}

// Raio do marcador proporcional ao valor da métrica (normalizado pelo máximo),
// com contraste controlado por MARKER_RADIUS.contrast.
function radiusFor(value, max) {
  const { min, max: maxR, contrast } = MARKER_RADIUS;
  if (!value || !max) return min;
  return min + (maxR - min) * Math.pow(value / max, contrast);
}

// Tooltip mostra sempre contagem e metragem.
function tooltipFor(props) {
  const obras = Number(props.obras_proximidade) || 0;
  const area = Number(props.area_total_sum) || 0;
  return [
    `<strong>${props.bairro || "Setor"}</strong>`,
    `Contagem: ${nf.format(obras)} obra(s)`,
    `Metragem: ${nf.format(area)} m²`,
  ].join("<br/>");
}

// Bounds que cobrem os setores responsáveis por `FOCUS.share` das obras —
// concentra o enquadramento na região central (mais densa).
function focusBounds(featuresProps) {
  const sorted = [...featuresProps].sort(
    (a, b) => (Number(b.obras_proximidade) || 0) - (Number(a.obras_proximidade) || 0),
  );
  const total = sorted.reduce((sum, p) => sum + (Number(p.obras_proximidade) || 0), 0);
  const points = [];
  let acc = 0;
  for (const props of sorted) {
    const [lon, lat] = props.centroid;
    points.push([lat, lon]);
    acc += Number(props.obras_proximidade) || 0;
    if (acc >= FOCUS.share * total) break;
  }
  return L.latLngBounds(points);
}

function MetricToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-brand-border bg-slate-100 p-1">
      {Object.entries(METRICS).map(([id, { label }]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`min-w-[88px] rounded-md px-3 py-1.5 text-xs font-extrabold transition ${
            value === id
              ? "bg-brand-navy text-white shadow-sm"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ObrasMapCard({
  title = "Obras geolocalizadas em Tijucas",
  subtitle = "Setores censitários com obras ativas (CNO)",
  height = 430,
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const featuresRef = useRef([]); // props dos setores com obra
  const markerLayerRef = useRef(null);
  const metricRef = useRef("count");
  const [metric, setMetric] = useState("count");
  const [status, setStatus] = useState("loading");
  const [totals, setTotals] = useState({ obras: 0, area: 0 });

  // (Re)constrói a camada de marcadores conforme a métrica ativa.
  function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;
    if (markerLayerRef.current) markerLayerRef.current.remove();

    const metricKey = METRICS[metricRef.current].key;
    const data = featuresRef.current;
    const max = Math.max(1, ...data.map((d) => Number(d[metricKey]) || 0));

    const layer = L.layerGroup();
    data.forEach((props) => {
      const [lon, lat] = props.centroid;
      const value = Number(props[metricKey]) || 0;
      const marker = L.circleMarker([lat, lon], {
        radius: radiusFor(value, max),
        color: "#FFFFFF",
        weight: 1.5,
        fillColor: palette.orange,
        fillOpacity: 0.85,
      });
      marker.bindTooltip(tooltipFor(props), { direction: "top" });
      layer.addLayer(marker);
    });
    layer.addTo(map);
    markerLayerRef.current = layer;
  }

  // Inicializa o mapa e carrega os dados uma única vez.
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true, // zoom pela rodinha do mouse
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    let cancelled = false;

    fetch(GEOJSON_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((geojson) => {
        if (cancelled) return;

        L.geoJSON(geojson, { style: setorStyle }).addTo(map);

        // Apenas setores que efetivamente têm obras alimentam os marcadores.
        featuresRef.current = geojson.features
          .map((feature) => feature.properties)
          .filter((props) => Number(props?.obras_proximidade) > 0);

        renderMarkers();

        // Zoom padrão focado no núcleo central (mais obras).
        const bounds = focusBounds(featuresRef.current);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [FOCUS.padding, FOCUS.padding],
            maxZoom: FOCUS.maxZoom,
          });
        } else {
          map.setView([-27.2417, -48.6336], 14);
        }

        setTotals({
          obras: geojson.metadata?.obras_total ?? 0,
          area: geojson.metadata?.area_total ?? 0,
        });
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Falha ao carregar obras geolocalizadas.", error);
        if (!cancelled) setStatus("error");
      });

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      featuresRef.current = [];
      markerLayerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Reconstrói os marcadores quando muda a métrica.
  useEffect(() => {
    metricRef.current = metric;
    if (featuresRef.current.length) renderMarkers();
  }, [metric]);

  const badge =
    metric === "area"
      ? `${nf.format(totals.area)} m²`
      : `${nf.format(totals.obras)} obras`;

  return (
    <article
      className={`rounded-lg border border-white bg-white p-5 2xl:p-6 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-brand-navy">{title}</h3>
          {subtitle ? (
            <p className="text-xs font-semibold text-slate-700">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MetricToggle value={metric} onChange={setMetric} />
          <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-brand-orange">
            {badge}
          </span>
        </div>
      </div>

      {/* z-0 cria um contexto de empilhamento próprio, confinando os z-index
          internos altos do Leaflet abaixo do header sticky (z-30). */}
      <div className="relative z-0">
        <div
          ref={containerRef}
          className="w-full overflow-hidden rounded-lg border border-brand-border"
          style={{ height }}
        />
        {status !== "ready" ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-white/70 text-sm font-bold text-slate-600">
            {status === "error"
              ? "Não foi possível carregar o mapa de obras."
              : "Carregando mapa…"}
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-600">
        Cada bola é um setor censitário com obras; o tamanho representa a{" "}
        {metric === "area" ? "metragem total" : "quantidade de obras"}. O tooltip
        mostra contagem e metragem. Use a rodinha do mouse para o zoom. Fonte: CNO
        / IBGE. Coleta/consulta em 2026.
      </p>
    </article>
  );
}
