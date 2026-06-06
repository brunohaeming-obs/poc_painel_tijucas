"""Gera um GeoJSON das obras geolocalizadas de Tijucas a partir do CSV bruto.

Lê public/data/dados_obras_tijucas.csv, decodifica a coluna `geometry` (WKB,
polígonos de setor censitário) e emite um FeatureCollection em
public/data/construcao/obras_tijucas.geojson, com as propriedades necessárias
para o mapa Leaflet (incluindo o popup_html já formatado no CSV).
"""

import ast
import json
import re
import struct
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "public" / "data" / "dados_obras_tijucas.csv"
OUT_PATH = ROOT / "public" / "data" / "construcao" / "obras_tijucas.geojson"
OUT_SERIES_PATH = (
    ROOT / "public" / "data" / "construcao" / "obras_series_mensal.json"
)

# Nomes de bairro chegam com caixa inconsistente e acentos corrompidos na
# origem (o caractere "�" substituiu Ç/Á e o byte original se perdeu).
# Mapeamos cada variante (chave = valor cru em maiúsculas) para o nome limpo.
BAIRRO_CANON = {
    "CENTRO": "Centro",
    "XV DE NOVEMBRO": "XV de Novembro",
    "PRACA": "Praça",
    "PRA�A": "Praça",
    "PRAÇA": "Praça",
    "UNIVERSITARIO": "Universitário",
    "UNIVERSIT�RIO": "Universitário",
    "UNIVERSITÁRIO": "Universitário",
    "AREIAS": "Areias",
    "JOAIA": "Joaiá",
    "SUL DO RIO": "Sul do Rio",
    "TERRA NOVA": "Terra Nova",
    "SANTA LUZIA": "Santa Luzia",
    "SEM DADOS": "Sem bairro",
}


def canon_bairro(raw):
    if raw is None or (isinstance(raw, float)):
        return "Sem bairro"
    key = " ".join(str(raw).strip().upper().split())
    return BAIRRO_CANON.get(key, str(raw).strip().title())


def _read_ring(buf, offset, little):
    fmt_u = "<I" if little else ">I"
    fmt_d = "<dd" if little else ">dd"
    (npts,) = struct.unpack_from(fmt_u, buf, offset)
    offset += 4
    ring = []
    for _ in range(npts):
        x, y = struct.unpack_from(fmt_d, buf, offset)
        ring.append([x, y])
        offset += 16
    return ring, offset


def _read_polygon(buf, offset, little):
    fmt_u = "<I" if little else ">I"
    (nrings,) = struct.unpack_from(fmt_u, buf, offset)
    offset += 4
    rings = []
    for _ in range(nrings):
        ring, offset = _read_ring(buf, offset, little)
        rings.append(ring)
    return rings, offset


def wkb_to_geojson(raw):
    """Decodifica um WKB (Polygon ou MultiPolygon) para geometria GeoJSON."""
    buf = ast.literal_eval(raw) if isinstance(raw, str) else raw
    little = buf[0] == 1
    fmt_u = "<I" if little else ">I"
    (geom_type,) = struct.unpack_from(fmt_u, buf, 1)
    offset = 5

    if geom_type == 3:  # Polygon
        rings, _ = _read_polygon(buf, offset, little)
        return {"type": "Polygon", "coordinates": rings}

    if geom_type == 6:  # MultiPolygon
        (npoly,) = struct.unpack_from(fmt_u, buf, offset)
        offset += 4
        polygons = []
        for _ in range(npoly):
            little = buf[offset] == 1
            offset += 1
            offset += 4  # skip nested geometry type (polygon)
            rings, offset = _read_polygon(buf, offset, little)
            polygons.append(rings)
        return {"type": "MultiPolygon", "coordinates": polygons}

    raise ValueError(f"Tipo de geometria WKB não suportado: {geom_type}")


def centroid(geometry):
    """Centroide simples (média dos vértices do anel externo)."""
    if geometry["type"] == "Polygon":
        ring = geometry["coordinates"][0]
    else:  # MultiPolygon: usa o primeiro polígono
        ring = geometry["coordinates"][0][0]
    lon = sum(pt[0] for pt in ring) / len(ring)
    lat = sum(pt[1] for pt in ring) / len(ring)
    return [round(lon, 6), round(lat, 6)]


PROP_COLUMNS = [
    "CD_SETOR",
    "bairro",
    "logradouro",
    "cno",
    "nome_empresarial",
    "categoria",
    "destinacao",
    "tipo_obra",
    "ano_inicio",
    "ano_registro",
    "obras_proximidade",
    "area_total_sum",
    "populacao_cidade",
]


_ROW_RE = re.compile(r"<tr>(.*?)</tr>", re.S)
_CELL_RE = re.compile(r"<td>(.*?)</td>", re.S)


def parse_obras(df):
    """Extrai obras únicas (por CNO) das tabelas embutidas em popup_html.

    Retorna lista de (ano_inicio, meses_inicio, area_total). `ano_inicio` no CSV
    guarda só o ano; `meses_inicio` é a duração em meses desde o início — então
    o mês de início é recuperável como (referência − meses_inicio).
    """
    obras = {}
    for html in df["popup_html"].dropna():
        for tr in _ROW_RE.findall(html):
            cells = [c.strip() for c in _CELL_RE.findall(tr)]
            if len(cells) < 13:
                continue
            cno = cells[0]
            try:
                obras[cno] = (int(cells[3][:4]), int(cells[4]), float(cells[9]))
            except ValueError:
                continue
    return list(obras.values())


def detect_reference_month(obras):
    """Acha o índice de mês de referência que torna (ref − meses) consistente
    com o ano_inicio de cada obra (maximiza o nº de obras consistentes)."""
    ano_max = max(ano for ano, _, _ in obras)
    best = None
    for ref in range(ano_max * 12, (ano_max + 4) * 12):
        ok = sum(1 for ano, meses, _ in obras if (ref - meses) // 12 == ano)
        if best is None or ok > best[0]:
            best = (ok, ref)
    return best  # (consistencia, ref_idx)


def build_monthly_series(df):
    """Série histórica mensal de obras iniciadas (contagem e metragem)."""
    obras = parse_obras(df)
    consistencia, ref = detect_reference_month(obras)

    counts, areas = {}, {}
    for _, meses, area in obras:
        idx = ref - meses
        counts[idx] = counts.get(idx, 0) + 1
        areas[idx] = areas.get(idx, 0.0) + area

    series = []
    for idx in range(min(counts), max(counts) + 1):  # contínuo, preenche zeros
        ano, mes = idx // 12, idx % 12 + 1
        series.append(
            {
                "periodo": f"{ano}-{mes:02d}",
                "obras": counts.get(idx, 0),
                "metragem": round(areas.get(idx, 0.0)),
            }
        )

    ref_ano, ref_mes = ref // 12, ref % 12 + 1
    return {
        "metadata": {
            "municipio": "Tijucas",
            "obras_total": len(obras),
            "mes_referencia": f"{ref_ano}-{ref_mes:02d}",
            "consistencia": f"{consistencia}/{len(obras)}",
            "fonte": "dados_obras_tijucas.csv (CNO) — mês de início derivado de meses_inicio",
        },
        "series": series,
    }


def main():
    df = pd.read_csv(CSV_PATH)
    features = []
    for _, row in df.iterrows():
        try:
            geometry = wkb_to_geojson(row["geometry"])
        except Exception as exc:  # pragma: no cover - diagnóstico
            print(f"Pulando setor {row.get('CD_SETOR')}: {exc}")
            continue

        props = {}
        for col in PROP_COLUMNS:
            value = row.get(col)
            if pd.isna(value):
                value = None
            elif hasattr(value, "item"):
                value = value.item()
            props[col] = value
        props["bairro"] = canon_bairro(props.get("bairro"))
        props["centroid"] = centroid(geometry)

        features.append(
            {"type": "Feature", "geometry": geometry, "properties": props}
        )

    total_obras = int(df["obras_proximidade"].sum())
    total_area = int(df["area_total_sum"].sum())
    collection = {
        "type": "FeatureCollection",
        "metadata": {
            "municipio": "Tijucas",
            "setores": len(features),
            "obras_total": total_obras,
            "area_total": total_area,
            "fonte": "dados_obras_tijucas.csv (CNO / IBGE setores censitários)",
        },
        "features": features,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(collection, ensure_ascii=False), encoding="utf-8"
    )
    print(
        f"OK: {len(features)} setores, {total_obras} obras de proximidade "
        f"-> {OUT_PATH.relative_to(ROOT)}"
    )

    # Série histórica mensal de obras iniciadas.
    monthly = build_monthly_series(df)
    OUT_SERIES_PATH.write_text(
        json.dumps(monthly, ensure_ascii=False), encoding="utf-8"
    )
    print(
        f"OK: série mensal {len(monthly['series'])} meses "
        f"(ref {monthly['metadata']['mes_referencia']}, "
        f"consistência {monthly['metadata']['consistencia']}) "
        f"-> {OUT_SERIES_PATH.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
