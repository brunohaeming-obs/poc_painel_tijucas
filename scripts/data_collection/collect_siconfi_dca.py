import argparse
import csv
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
SC_MUNICIPIOS_PATH = PROJECT_ROOT / "src" / "data" / "ibgeScMunicipioNames.json"
BASE_URL = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca"
DEFAULT_ID_ENTE_TIJUCAS = 4218004
DEFAULT_LIMIT = 5000
DEFAULT_RETRIES = 3
CSV_FIELDNAMES = [
    "an_exercicio_consulta",
    "id_ente_consulta",
    "municipio_consulta",
    "exercicio",
    "instituicao",
    "cod_ibge",
    "uf",
    "populacao",
    "anexo",
    "rotulo",
    "coluna",
    "cod_conta",
    "conta",
    "valor",
]


def request_json(params: dict, *, retries: int = DEFAULT_RETRIES) -> dict:
    url = f"{BASE_URL}?{urlencode(params)}"
    request = Request(url, headers={"User-Agent": "poc-painel-tijucas/1.0"})

    for attempt in range(retries + 1):
        try:
            with urlopen(request, timeout=90) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                return json.loads(response.read().decode(charset))
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            if exc.code < 500 or attempt >= retries:
                raise RuntimeError(f"Erro HTTP {exc.code} ao consultar {url}: {detail}") from exc
        except (TimeoutError, URLError) as exc:
            if attempt >= retries:
                reason = getattr(exc, "reason", exc)
                raise RuntimeError(f"Erro de rede ao consultar {url}: {reason}") from exc

        wait_seconds = 5 * (attempt + 1)
        print(f"  tentativa {attempt + 1} falhou; aguardando {wait_seconds}s para repetir...")
        time.sleep(wait_seconds)

    raise RuntimeError(f"Falha inesperada ao consultar {url}")


def fetch_dca_year(
    *,
    id_ente: int,
    municipio: str | None,
    ano: int,
    no_anexo: str | None,
    limit: int,
    throttle_seconds: float,
) -> list[dict]:
    rows: list[dict] = []
    offset = 0
    first_request = True

    while True:
        if not first_request:
            time.sleep(throttle_seconds)
        first_request = False

        params = {
            "an_exercicio": ano,
            "id_ente": id_ente,
            "limit": limit,
            "offset": offset,
        }
        if no_anexo:
            params["no_anexo"] = no_anexo

        payload = request_json(params)
        items = payload.get("items", [])
        if not isinstance(items, list):
            raise RuntimeError(f"Resposta inesperada para {ano}: campo 'items' ausente ou invalido.")

        for item in items:
            item["id_ente_consulta"] = id_ente
            item["an_exercicio_consulta"] = ano
            item["municipio_consulta"] = municipio
            rows.append(item)

        has_more = payload.get("hasMore", payload.get("has_more", False))
        if not has_more or not items:
            break

        offset += len(items)

    return rows


def write_csv(rows: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = sorted(set(CSV_FIELDNAMES) | {key for row in rows for key in row.keys()})

    with output_path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def load_sc_municipios() -> list[tuple[int, str]]:
    with SC_MUNICIPIOS_PATH.open(encoding="utf-8-sig") as file:
        municipios = json.load(file)

    return sorted((int(id_ente), nome) for id_ente, nome in municipios.items())


def append_rows(rows: list[dict], output_path: Path, *, write_header: bool) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("a", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_FIELDNAMES, extrasaction="ignore")
        if write_header:
            writer.writeheader()
        writer.writerows(rows)


def read_checkpoint(checkpoint_path: Path | None) -> set[str]:
    if checkpoint_path is None or not checkpoint_path.exists():
        return set()

    with checkpoint_path.open(encoding="utf-8") as file:
        payload = json.load(file)

    completed = payload.get("completed", [])
    if not isinstance(completed, list):
        raise RuntimeError(f"Checkpoint invalido: {checkpoint_path}")
    return set(completed)


def write_checkpoint(checkpoint_path: Path | None, completed: set[str]) -> None:
    if checkpoint_path is None:
        return

    checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"completed": sorted(completed)}
    checkpoint_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Baixa a serie historica da DCA/Contas Anuais do Siconfi para um ente."
    )
    parser.add_argument("--id-ente", type=int, default=DEFAULT_ID_ENTE_TIJUCAS, help="Codigo IBGE do ente.")
    parser.add_argument("--sc-municipios", action="store_true", help="Baixa todos os municipios de SC.")
    parser.add_argument("--ano-inicio", type=int, default=2013, help="Primeiro exercicio a baixar.")
    parser.add_argument("--ano-fim", type=int, default=2024, help="Ultimo exercicio a baixar.")
    parser.add_argument("--anexo", dest="no_anexo", help="Filtra um anexo especifico da DCA.")
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT, help="Registros por pagina.")
    parser.add_argument(
        "--throttle-seconds",
        type=float,
        default=1.05,
        help="Espera entre requisicoes para respeitar o limite da API.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=RAW_DATA_DIR / "siconfi" / "SICONFI_DCA_Tijucas_serie_historica.csv",
        help="Arquivo CSV de saida.",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        help="Arquivo JSON de progresso para retomar coletas em lote.",
    )
    parser.add_argument(
        "--append",
        action="store_true",
        help="Acrescenta ao CSV existente. Use com checkpoint para retomar.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.ano_fim < args.ano_inicio:
        raise SystemExit("--ano-fim deve ser maior ou igual a --ano-inicio.")

    municipios = load_sc_municipios() if args.sc_municipios else [(args.id_ente, None)]
    completed = read_checkpoint(args.checkpoint)
    write_header = not args.append or not args.output.exists()
    total_rows = 0

    if not args.append and args.output.exists():
        args.output.unlink()

    for id_ente, municipio in municipios:
        for ano in range(args.ano_inicio, args.ano_fim + 1):
            checkpoint_key = f"{id_ente}:{ano}"
            if checkpoint_key in completed:
                continue

            nome = municipio or str(id_ente)
            print(f"Baixando DCA {ano} para {nome} ({id_ente})...")
            rows = fetch_dca_year(
                id_ente=id_ente,
                municipio=municipio,
                ano=ano,
                no_anexo=args.no_anexo,
                limit=args.limit,
                throttle_seconds=args.throttle_seconds,
            )
            append_rows(rows, args.output, write_header=write_header)
            write_header = False
            total_rows += len(rows)
            completed.add(checkpoint_key)
            write_checkpoint(args.checkpoint, completed)
            print(f"  {len(rows)} registros")
            time.sleep(args.throttle_seconds)

    print(f"Arquivo salvo em: {args.output}")
    print(f"Novos registros nesta execucao: {total_rows}")


if __name__ == "__main__":
    main()
