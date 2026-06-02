# Como visualizar a secao de Educacao

## Onde os dados precisam estar

Os arquivos devem existir em:

- `public/data/educacao/`
- `public/downloads/educacao/`

JSONs esperados em `public/data/educacao/`:

- `educacao_indicadores_long.json`
- `educacao_series_temporais.json`
- `educacao_cards_resumo.json`
- `educacao_mapa_escolas.json`
- `educacao_metadata.json`

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Inicie o Vite:

```bash
npm run dev
```

3. Abra no navegador:

```text
http://127.0.0.1:5173/
```

Se a porta 5173 estiver ocupada, o Vite mostrara outra porta no terminal.

## Como validar build de producao

```bash
npm run build
```

## Se os dados nao aparecerem

Verifique:

- se os cinco JSONs estao em `public/data/educacao/`
- se os CSVs de download estao em `public/downloads/educacao/`
- se os nomes dos arquivos estao exatamente iguais aos esperados
- se o console do navegador mostra erro de fetch para `/data/educacao/...`

Mensagem esperada no app em caso de ausencia:

`Dados de educacao nao encontrados. Verifique os arquivos em public/data/educacao.`
