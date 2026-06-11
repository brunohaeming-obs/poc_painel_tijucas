"""Inspeciona o HTML real da página dados-abertos do IEGM para entender a estrutura."""

from playwright.sync_api import sync_playwright
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Interceptar todas as respostas XHR/fetch
        api_data = []
        def on_response(response):
            url = response.url
            if "iegm.irbcontas" in url and "dados" in url.lower():
                try:
                    body = response.text()
                    api_data.append({"url": url, "body": body})
                    print(f"[API] {url} — {len(body)} chars")
                    if len(body) < 3000:
                        print(body[:2000])
                    else:
                        print(body[:500])
                        print("...")
                        print(body[-500:])
                except Exception as e:
                    print(f"[API] {url} — erro: {e}")

        page.on("response", on_response)

        url = "https://iegm.irbcontas.org.br/index.php?r=site%2Fdados-abertos&exercicio=2024&uf=SC"
        print(f"Abrindo: {url}\n")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(4000)

        # Capturar HTML completo
        html = page.content()
        out = ROOT / "data" / "raw" / "iegm_debug_2024_SC.html"
        out.write_text(html, encoding="utf-8")
        print(f"\nHTML salvo: {out}")
        print(f"Tamanho HTML: {len(html)} chars")

        # Verificar seletores
        print("\n--- Seletores encontrados ---")
        for sel in ["table", "#dadosAbertos", "tbody tr", "table tbody tr", ".dataTables_wrapper"]:
            count = page.locator(sel).count()
            print(f"  {sel}: {count}")

        # Tentar pegar todas as tabelas
        tables = page.eval_on_selector_all("table", "ts => ts.map(t => ({id: t.id, rows: t.rows.length, html: t.outerHTML.substring(0, 300)}))")
        print(f"\n--- Tabelas encontradas: {len(tables)} ---")
        for t in tables:
            print(f"  id={t['id']} rows={t['rows']}")
            print(f"  {t['html']}")
            print()

        browser.close()

if __name__ == "__main__":
    main()
