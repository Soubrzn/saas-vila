"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formNumber, formString, redirectWithParams } from "@/actions/utils";
import { createClient } from "@/lib/supabase/server";

export async function registerStockMovementAction(formData: FormData) {
  const productId = formString(formData, "product_id");
  const movementKind = formString(formData, "movement_kind");
  const quantity = formNumber(formData, "quantity");
  const notes = formString(formData, "notes");
  const supabase = await createClient();

  const { error } = await supabase.rpc("register_stock_movement", {
    p_product_id: productId,
    p_movement_kind: movementKind,
    p_quantity: quantity,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      redirectWithParams("/estoque", {
        error: error.message,
      }),
    );
  }

  revalidatePath("/estoque");
  revalidatePath("/dashboard");
  revalidatePath("/produtos");
  revalidatePath("/vendas/nova");

  redirect(
    redirectWithParams("/estoque", {
      message: "Movimento registrado.",
    }),
  );
}
