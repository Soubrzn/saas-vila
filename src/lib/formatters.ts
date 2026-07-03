export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const integerFormatter = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value: number | string | null | undefined) {
  const parsed = typeof value === "string" ? Number(value) : value;

  return brlFormatter.format(Number.isFinite(parsed) ? Number(parsed) : 0);
}
