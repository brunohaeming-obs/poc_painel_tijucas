"""Diagnóstico: intercepta chamadas de rede do portal IEGM para descobrir endpoints."""

from playwright.sync_api import sync_playwright
import json

URL = "https://iegm.irbcontas.org.br"
ANOS = ["2024", "2023"]
UF = "SC"


def main():
    api_calls = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        def on_response(response):
            url = response.url
            if any(k in url for k in ["api", "json", "data", "municipio", "iegm", "result"]):
                try:
                    ct = response.headers.get("content-type", "")
                    if "json" in ct or "text" in ct:
                        body = response.text()
                        api_calls.append({"url": url, "status": response.status, "body_preview": body[:500]})
                        print(f"[CAPTURADO] {url}")
                except Exception:
                    pass

        page.on("response", on_response)

        print(f"Abrindo {URL} ...")
        page.goto(URL, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)

        # Tentar selecionar SC
        try:
            page.select_option("select", UF)
            page.wait_for_timeout(3000)
            print("Selecionou SC")
        except Exception as e:
            print(f"Não conseguiu selecionar SC via select: {e}")

        # Tentar selecionar ano
        for ano in ANOS:
            try:
                selects = page.locator("select").all()
                for sel in selects:
                    opts = sel.evaluate("el => [...el.options].map(o => o.value)")
                    if ano in opts:
                        sel.select_option(ano)
                        page.wait_for_timeout(2000)
                        print(f"Selecionou ano {ano}")
                        break
            except Exception as e:
                print(f"Não conseguiu selecionar ano {ano}: {e}")

        # Capturar conteúdo HTML da tabela
        html = page.content()
        with open("iegm_page_source.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("HTML salvo em iegm_page_source.html")

        browser.close()

    print(f"\n=== {len(api_calls)} chamadas capturadas ===")
    for call in api_calls:
        print(f"\nURL: {call['url']}")
        print(f"Status: {call['status']}")
        print(f"Body: {call['body_preview']}")

    with open("iegm_api_calls.json", "w", encoding="utf-8") as f:
        json.dump(api_calls, f, ensure_ascii=False, indent=2)
    print("\nResultados salvos em iegm_api_calls.json")


if __name__ == "__main__":
    main()
