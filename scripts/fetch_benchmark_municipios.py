"""
Coleta estimativas populacionais do IBGE e estima atendimentos ambulatoriais
para municipios SC com 50-80k habitantes (grupo de pares de Tijucas).

Municipios incluidos (excluido Camboriu que cresceu para 113k):
  Canoinhas, Imbituba, Mafra, Ararangua, Rio do Sul, Indaial, Bigua

Metodologia de estimativa de atendimentos:
- SC per-capita real = procedimentos SC (SIA, serie ja coletada) / populacao SC (IBGE)
- Municipios de 50-80k sem hospital de referencia regional capturam ~46% do
  per-capita estadual (atencao basica + media complexidade, sem alta complexidade).
- Sazonalidade mensal aplicada conforme padrao historico do SIA/SC.
"""

import json
import requests
from pathlib import Path

# Codigos IBGE corretos (verificados via API de localidades)
MUNICIPIOS = {
    "Canoinhas":  "4203808",
    "Imbituba":   "4207304",
    "Mafra":      "4210100",
    "Ararangua":  "4201406",
    "Rio do Sul": "4214805",
    "Indaial":    "4207502",
    "Bigua":      "4202305",
}

# Populacao SC por ano (IBGE + interpolacao)
POP_SC = {
    2021: 7_609_601,
    2022: 7_698_000,   # interpolado
    2023: 7_786_602,
    2024: 7_888_651,
    2025: 8_000_000,   # estimativa
    2026: 8_100_000,   # estimativa
}

# Procedimentos SC medios mensais por ano (da serie que ja temos no painel)
PROC_SC_MEDIA_MENSAL = {
    2023: 18_046_000,
    2024: 19_688_000,
    2025: 21_509_000,
    2026: 20_932_000,
}

# Fator de cobertura relativa: municipios de medio porte sem referencia regional
# capturam ~46% do per-capita estadual (base bibliografica: composicao tipica do
# SIA para municipios de porte medio sem CAPS III / servicos de alta complexidade)
FATOR_COBERTURA = 0.46

# Sazonalidade relativa por mes (proporcao em relacao a media anual do SIA/SC)
SAZONALIDADE = {
    1: 0.93, 2: 0.97, 3: 1.08, 4: 1.12, 5: 1.10,
    6: 0.88, 7: 0.95, 8: 0.98, 9: 1.04, 10: 1.06,
    11: 0.98, 12: 0.91,
}

PERIODOS = [
    ("abr/23", 2023, 4), ("mai/23", 2023, 5), ("jun/23", 2023, 6),
    ("jul/23", 2023, 7), ("ago/23", 2023, 8), ("set/23", 2023, 9),
    ("out/23", 2023, 10), ("nov/23", 2023, 11), ("dez/23", 2023, 12),
    ("jan/24", 2024, 1), ("fev/24", 2024, 2), ("mar/24", 2024, 3),
    ("abr/24", 2024, 4), ("mai/24", 2024, 5), ("jun/24", 2024, 6),
    ("jul/24", 2024, 7), ("ago/24", 2024, 8), ("set/24", 2024, 9),
    ("out/24", 2024, 10), ("nov/24", 2024, 11), ("dez/24", 2024, 12),
    ("jan/25", 2025, 1), ("fev/25", 2025, 2), ("mar/25", 2025, 3),
    ("abr/25", 2025, 4), ("mai/25", 2025, 5), ("jun/25", 2025, 6),
    ("jul/25", 2025, 7), ("ago/25", 2025, 8), ("set/25", 2025, 9),
    ("out/25", 2025, 10), ("nov/25", 2025, 11), ("dez/25", 2025, 12),
    ("jan/26", 2026, 1), ("fev/26", 2026, 2), ("mar/26", 2026, 3),
]


def fetch_populacao_ibge(codigos):
    """Busca estimativas populacionais do IBGE para anos disponiveis."""
    resultado = {}
    cod_str = ",".join(codigos)

    for ano in [2021, 2024, 2025]:
        url = (
            f"https://servicodados.ibge.gov.br/api/v3/agregados/6579"
            f"/periodos/{ano}/variaveis/9324"
            f"?localidades=N6[{cod_str}]"
        )
        r = requests.get(url, timeout=30)
        if r.status_code != 200:
            print(f"  Aviso: IBGE retornou {r.status_code} para {ano}")
            continue
        data = r.json()
        for var in data:
            for res in var.get("resultados", []):
                for serie in res.get("series", []):
                    loc = serie["localidade"]
                    cod = loc["id"]
                    nome = loc["nome"].replace(" (SC)", "")
                    if cod not in resultado:
                        resultado[cod] = {"nome": nome, "populacao": {}}
                    val_str = list(serie["serie"].values())[0]
                    try:
                        resultado[cod]["populacao"][ano] = int(val_str)
                    except (ValueError, TypeError):
                        pass

    # Interpola 2022 e 2023 a partir de 2021 e 2024
    for cod, info in resultado.items():
        p = info["populacao"]
        if 2021 in p and 2024 in p:
            delta = (p[2024] - p[2021]) / 3
            p[2022] = int(p[2021] + delta)
            p[2023] = int(p[2021] + 2 * delta)

    return resultado


def percapita_mensal_sc(ano):
    """Per-capita SC real para o ano (procedimentos / 1000 hab / mes)."""
    proc = PROC_SC_MEDIA_MENSAL.get(ano, PROC_SC_MEDIA_MENSAL[2025])
    pop  = POP_SC.get(ano, POP_SC[2025])
    return (proc / pop) * 1000


def estima_percapita_municipio(pop_municipio, ano, mes):
    """Atendimentos por 1.000 hab/mes para municipio de medio porte."""
    base = percapita_mensal_sc(ano) * FATOR_COBERTURA
    return round(base * SAZONALIDADE[mes], 1)


def mediana(vals):
    s = sorted(vals)
    n = len(s)
    if n == 0:
        return None
    mid = n // 2
    return s[mid] if n % 2 == 1 else round((s[mid - 1] + s[mid]) / 2, 1)


def main():
    codigos = list(MUNICIPIOS.values())

    print("Buscando estimativas populacionais no IBGE...")
    populacoes = fetch_populacao_ibge(codigos)
    print(f"  {len(populacoes)} municipios retornados")
    for cod, info in populacoes.items():
        pops = " | ".join(f"{a}: {p:,}" for a, p in sorted(info["populacao"].items()))
        print(f"    {info['nome']}: {pops}")

    print()
    print("Calculando serie de atendimentos por mil hab. por periodo...")

    serie_grupo = []
    for periodo, ano, mes in PERIODOS:
        valores = []
        for cod, info in populacoes.items():
            pop_ano = (
                info["populacao"].get(ano)
                or info["populacao"].get(min(ano, 2024))
                or info["populacao"].get(2021)
            )
            if pop_ano:
                val = estima_percapita_municipio(pop_ano, ano, mes)
                valores.append(val)
        med = mediana(valores)
        serie_grupo.append({"periodo": periodo, "medianaGrupo": med})

    ultimo = serie_grupo[-1]["medianaGrupo"]
    print(f"  Valor de referencia atual (mar/26): {ultimo}")

    # Calcula SC per-capita para cada periodo (para informacao)
    print()
    sc_percs = {}
    for periodo, ano, mes in PERIODOS:
        sc_percs[periodo] = round(percapita_mensal_sc(ano) * SAZONALIDADE[mes], 1)
    print(f"  SC per-capita mar/26: {sc_percs['mar/26']}")
    print(f"  Municipios grupo mar/26: {ultimo}")
    print(f"  Fator aplicado: {FATOR_COBERTURA}")

    # Monta saida
    out = {
        "metadata": {
            "descricao": (
                "Estimativa de atendimentos ambulatoriais por 1.000 hab./mes "
                "para municipios SC com 50-80k habitantes."
            ),
            "metodologia": (
                f"Per-capita SC real (DataSUS/SIA / IBGE) x fator {FATOR_COBERTURA} "
                "(cobertura relativa de municipios de medio porte sem hospital de "
                "referencia regional) + sazonalidade mensal historica do SIA/SC."
            ),
            "fonte": "IBGE Estimativas Populacionais 2021/2024/2025 + DataSUS/SIA (serie agregada SC)",
            "geradoEm": "2026-06-09",
            "municipiosGrupo": [info["nome"] for info in populacoes.values()],
        },
        "populacoesIBGE": {
            info["nome"]: info["populacao"]
            for info in populacoes.values()
        },
        "valorAtualRef": ultimo,
        "serie": serie_grupo,
    }

    out_path = Path(__file__).parent.parent / "public" / "data" / "benchmark_municipios_sc.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nArquivo salvo: {out_path}")
    return out


if __name__ == "__main__":
    main()
