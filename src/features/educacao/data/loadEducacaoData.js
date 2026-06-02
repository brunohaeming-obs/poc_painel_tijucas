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

export async function loadAllEducacaoData() {
  try {
    const [
      indicadoresLong,
      seriesTemporais,
      cardsResumo,
      mapaEscolas,
      metadata,
    ] = await Promise.all([
      loadEducacaoIndicadoresLong(),
      loadEducacaoSeriesTemporais(),
      loadEducacaoCardsResumo(),
      loadEducacaoMapaEscolas(),
      loadEducacaoMetadata(),
    ]);

    return {
      indicadoresLong,
      seriesTemporais,
      cardsResumo,
      mapaEscolas,
      metadata,
    };
  } catch (error) {
    console.error("Dados de educação não encontrados.", error);
    throw new Error(
      "Dados de educação não encontrados. Verifique os arquivos em public/data/educacao.",
    );
  }
}
