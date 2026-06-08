async function fetchEducacaoJson(path) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o arquivo ${path}.`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Falha ao carregar dados de educação em ${path}.`, error);
    throw error;
  }
}

async function fetchOptionalEducacaoJson(path) {
  try {
    return await fetchEducacaoJson(path);
  } catch (error) {
    console.warn(`Arquivo opcional de educação não carregado: ${path}.`, error);
    return null;
  }
}

export async function loadEducacaoIndicadoresLong() {
  return fetchEducacaoJson("/data/educacao/educacao_indicadores_long.json");
}

export async function loadEducacaoSeriesTemporais() {
  return fetchEducacaoJson("/data/educacao/educacao_series_temporais.json");
}

export async function loadEducacaoCardsResumo() {
  return fetchEducacaoJson("/data/educacao/educacao_cards_resumo.json");
}

export async function loadEducacaoMapaEscolas() {
  return fetchEducacaoJson("/data/educacao/educacao_mapa_escolas.json");
}

export async function loadEducacaoMetadata() {
  return fetchEducacaoJson("/data/educacao/educacao_metadata.json");
}

export async function loadEducacaoComparativoSc() {
  return fetchOptionalEducacaoJson("/data/educacao/educacao_comparativo_sc.json");
}

export async function loadEducacaoComparativoSc2024() {
  return fetchOptionalEducacaoJson("/data/educacao/educacao_comparativo_sc_2024.json");
}

export async function loadEducacaoIndicadoresApenasTijucas() {
  return fetchOptionalEducacaoJson("/data/educacao/educacao_indicadores_apenas_tijucas.json");
}

export async function loadEducacaoRendimento() {
  return fetchOptionalEducacaoJson("/data/educacao/educacao_rendimento.json");
}

export async function loadAllEducacaoData() {
  try {
    const [
      indicadoresLong,
      seriesTemporais,
      cardsResumo,
      mapaEscolas,
      metadata,
      comparativoSc,
      comparativoSc2024,
      indicadoresApenasTijucas,
      rendimento,
    ] = await Promise.all([
      loadEducacaoIndicadoresLong(),
      loadEducacaoSeriesTemporais(),
      loadEducacaoCardsResumo(),
      loadEducacaoMapaEscolas(),
      loadEducacaoMetadata(),
      loadEducacaoComparativoSc(),
      loadEducacaoComparativoSc2024(),
      loadEducacaoIndicadoresApenasTijucas(),
      loadEducacaoRendimento(),
    ]);

    return {
      indicadoresLong,
      seriesTemporais,
      cardsResumo,
      mapaEscolas,
      metadata,
      comparativoSc,
      comparativoSc2024,
      indicadoresApenasTijucas,
      rendimento,
    };
  } catch (error) {
    console.error("Dados de educação não encontrados.", error);
    throw new Error(
      "Dados de educação não encontrados. Verifique os arquivos em public/data/educacao.",
    );
  }
}
