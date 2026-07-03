import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
