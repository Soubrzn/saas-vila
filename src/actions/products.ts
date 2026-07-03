"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formNumber, formString, redirectWithParams } from "@/actions/utils";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validators/product";

export async function createProductAction(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formString(formData, "name"),
    cost_price: formNumber(formData, "cost_price"),
    sale_price: formNumber(formData, "sale_price"),
    current_stock: formNumber(formData, "current_stock"),
    minimum_stock: formNumber(formData, "minimum_stock"),
  });

  if (!parsed.success) {
    redirect(
      redirectWithParams("/produtos/novo", {
        error: parsed.error.issues[0]?.message ?? "Revise os dados do produto.",
      }),
    );
  }

  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    ...parsed.data,
    shop_id: shop.id,
  });

  if (error) {
    redirect(
      redirectWithParams("/produtos/novo", {
        error: error.message,
      }),
    );
  }

  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  redirect(
    redirectWithParams("/produtos", {
      message: "Produto cadastrado.",
    }),
  );
}
