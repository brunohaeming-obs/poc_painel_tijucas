async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${path}`);
  }
  return response.json();
}

export function getEconomiaEmployment() {
  return fetchJson("/data/economia/employment.json");
}

export function getEconomiaPibCitizen() {
  return fetchJson("/data/economia/pib_citizen.json");
}
