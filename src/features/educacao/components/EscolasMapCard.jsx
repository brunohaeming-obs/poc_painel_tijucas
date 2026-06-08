import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Mapa da rede escolar no mesmo padrão do mapa de obras (Leaflet + OpenStreetMap):
// basemap de tiles do OSM, contorno municipal como overlay e uma bola por escola.
const integerFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

const palette = {
  navy: "#000086",
  blue: "#007FFE",
  yellow: "#FCD418",
};

// Centro aproximado de Tijucas, usado como enquadramento de fallback.
const TIJUCAS_CENTER = [-27.2417, -48.6336];

function boundaryStyle() {
  return {
    color: palette.navy,
    weight: 2,
    fillColor: palette.blue,
    fillOpacity: 0.06,
  };
}

function tooltipFor(point) {
  const lines = [`<strong>${point.nome_escola || "Escola"}</strong>`];
  lines.push(`Bairro: ${point.bairro || "Não informado"}`);
  if (point.dependencia_administrativa) {
    lines.push(`Dependência: ${point.dependencia_administrativa}`);
  }
  if (point.localizacao) {
    lines.push(`Localização: ${point.localizacao}`);
  }
  if (point.matriculas != null) {
    lines.push(`Matrículas: ${integerFormatter.format(point.matriculas)}`);
  }
  return lines.join("<br/>");
}

export function EscolasMapCard({ points = [], boundary = null, height = 360, ariaLabel }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const markerLayerRef = useRef(null);

  // Inicializa o mapa e a camada de tiles do OpenStreetMap uma única vez.
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true, // zoom pela rodinha do mouse
      attributionControl: true,
    });
    mapRef.current = map;
    map.setView(TIJUCAS_CENTER, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      boundaryLayerRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  // (Re)desenha o contorno municipal quando o GeoJSON muda.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    if (boundaryLayerRef.current) boundaryLayerRef.current.remove();
    if (!boundary) return undefined;

    const layer = L.geoJSON(boundary, { style: boundaryStyle }).addTo(map);
    boundaryLayerRef.current = layer;
    return undefined;
  }, [boundary]);

  // (Re)constrói os marcadores das escolas e reenquadra quando os pontos mudam.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerLayerRef.current) markerLayerRef.current.remove();

    const layer = L.layerGroup();
    const latLngs = [];
    points.forEach((point) => {
      const lat = Number(point.latitude);
      const lon = Number(point.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      latLngs.push([lat, lon]);
      const marker = L.circleMarker([lat, lon], {
        radius: 7,
        color: "#FFFFFF",
        weight: 1.5,
        fillColor: palette.yellow,
        fillOpacity: 0.95,
      });
      marker.bindTooltip(tooltipFor(point), { direction: "top" });
      layer.addLayer(marker);
    });
    layer.addTo(map);
    markerLayerRef.current = layer;

    // Enquadra pelo contorno municipal; sem ele, usa os próprios pontos.
    let bounds = null;
    if (boundary) {
      const boundaryBounds = L.geoJSON(boundary).getBounds();
      if (boundaryBounds.isValid()) bounds = boundaryBounds;
    }
    if (!bounds && latLngs.length) bounds = L.latLngBounds(latLngs);
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
    }
  }, [points, boundary]);

  return (
    <div className="relative z-0 mt-6">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-[24px] border border-white/10"
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
}
