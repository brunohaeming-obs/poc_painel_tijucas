// Formatadores numéricos pt-BR compartilhados por todos os painéis.
// Centralizados aqui para evitar redefinições duplicadas em cada feature.

export const brInteger = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export const brCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const compactNumber = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const decimalNumber = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});
