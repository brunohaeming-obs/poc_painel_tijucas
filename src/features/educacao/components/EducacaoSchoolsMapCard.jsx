import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

const defaultCenter = [-27.2417, -48.6336];
const enrollmentFormatter = new Intl.NumberFormat("pt-BR");

function getEnrollmentValue(point) {
  const value = point?.matriculas_total_educacao_basica ?? point?.matriculas ?? null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function isValidPoint(point) {
  const latitude = Number(point?.latitude);
  const longitude = Number(point?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function radiusForEnrollment(value, maxValue) {
  if (value === null || maxValue === null || maxValue <= 0) {
    return 6;
  }

  const minRadius = 5;
  const maxRadius = 18;
  return minRadius + ((value / maxValue) * (maxRadius - minRadius));
}

function buildTooltip(point) {
  const enrollmentValue = getEnrollmentValue(point);

  return [
    `<strong>${point?.nome_escola ?? "Escola não identificada"}</strong>`,
    `Bairro: ${point?.bairro || "Não informado"}`,
    `Dependência administrativa: ${point?.dependencia_administrativa || "Não informada"}`,
    enrollmentValue !== null
      ? `Matrículas: ${enrollmentFormatter.format(enrollmentValue)}`
      : "Matrículas: não disponível",
  ].join("<br/>");
}

export function EducacaoSchoolsMapCard({
  title = "Escolas georreferenciadas em Tijucas",
  subtitle = "Pontos das escolas com coordenadas disponíveis no Censo Escolar",
  points = [],
  height = 430,
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true,
      attributionControl: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (markersLayerRef.current) {
        markersLayerRef.current.remove();
        markersLayerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const validPoints = points.filter(isValidPoint);

    if (markersLayerRef.current) {
      markersLayerRef.current.remove();
      markersLayerRef.current = null;
    }

    if (!validPoints.length) {
      map.setView(defaultCenter, 13);
      setStatus("empty");
      return;
    }

    const maxEnrollment = validPoints.reduce((max, point) => {
      const value = getEnrollmentValue(point);
      return value !== null && value > max ? value : max;
    }, 0);

    const markersLayer = L.layerGroup();
    const bounds = [];

    validPoints.forEach((point) => {
      const latitude = Number(point.latitude);
      const longitude = Number(point.longitude);
      const enrollmentValue = getEnrollmentValue(point);
      const marker = L.circleMarker([latitude, longitude], {
        radius: radiusForEnrollment(enrollmentValue, maxEnrollment || null),
        color: "#FFFFFF",
        weight: 1.5,
        fillColor: "#F2A116",
        fillOpacity: 0.85,
      });

      marker.bindTooltip(buildTooltip(point), { direction: "top" });
      markersLayer.addLayer(marker);
      bounds.push([latitude, longitude]);
    });

    markersLayer.addTo(map);
    markersLayerRef.current = markersLayer;
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
    setStatus("ready");
  }, [points]);

  return (
    <article
      className={`rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-white">{title}</h3>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p> : null}
      </div>

      <div className="relative z-0">
        <div
          ref={containerRef}
          className="w-full overflow-hidden rounded-lg border border-white/10"
          style={{ height }}
        />

        {status !== "ready" ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg border border-[#F2A116]/40 bg-[#FDE7C2]/95 px-6 text-center text-sm font-bold text-[#10213A] shadow-[0_14px_28px_rgba(16,33,58,0.10)]">
            {status === "empty"
              ? "Não há escolas com coordenadas válidas para exibir no mapa."
              : "Carregando mapa..."}
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-xs leading-6 text-slate-300">
        Cada ponto representa uma escola com coordenadas disponíveis na base. Escolas sem
        latitude/longitude permanecem na tabela, mas não aparecem no mapa. Fonte: Censo
        Escolar/INEP.
      </p>
    </article>
  );
}
