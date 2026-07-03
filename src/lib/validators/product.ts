import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  cost_price: z.coerce.number().min(0, "O custo nao pode ser negativo."),
  sale_price: z.coerce.number().min(0, "A venda nao pode ser negativa."),
  current_stock: z.coerce.number().int().min(0, "O estoque nao pode ser negativo."),
  minimum_stock: z.coerce.number().int().min(0, "O minimo nao pode ser negativo."),
});
