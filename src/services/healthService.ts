async function fetchHealthJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar ${path}`);
  }
  return response.json() as Promise<T>;
}

export function getHealthDashboard() {
  return fetchHealthJson("/data/saude_dashboard.json");
}

export function getHealthProcedures() {
  return fetchHealthJson("/data/saude_procedimentos.json");
}

export function getHealthAps() {
  return fetchHealthJson("/data/saude_aps.json");
}

export function getHealthVaccination() {
  return fetchHealthJson("/data/saude_vacinacao.json");
}
