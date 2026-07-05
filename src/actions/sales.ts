"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formNumber, formString, redirectWithParams } from "@/actions/utils";
import { createClient } from "@/lib/supabase/server";

export async function registerSaleAction(formData: FormData) {
  const supabase = await createClient();
  const customerId = formString(formData, "customer_id") || null;
  const paymentType = formString(formData, "payment_type");
  const notes = formString(formData, "notes");
  const discountTotal = formNumber(formData, "discount_total");
  const itemsValue = formString(formData, "items");
  const saleRequestId = formString(formData, "sale_request_id");
  const productId = formString(formData, "product_id");
  const quantity = formNumber(formData, "quantity");

  let items: unknown = [];

  if (itemsValue) {
    try {
      items = JSON.parse(itemsValue);
    } catch {
      redirect(
        redirectWithParams("/vendas/nova", {
          error: "Itens da venda invalidos.",
        }),
      );
    }
  } else if (productId && quantity > 0) {
    items = [
      {
        product_id: productId,
        quantity,
      },
    ];
  } else {
    redirect(
      redirectWithParams("/vendas/nova", {
        error: "Selecione um produto e informe a quantidade.",
      }),
    );
  }

  const { data, error } = await supabase.rpc("register_sale", {
    p_customer_id: customerId,
    p_payment_type: paymentType,
    p_discount_total: discountTotal,
    p_notes: notes || null,
    p_items: items,
    p_idempotency_key: saleRequestId || null,
  });

  if (error) {
    redirect(
      redirectWithParams("/vendas/nova", {
        error: error.message,
      }),
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/produtos");
  revalidatePath("/estoque");
  revalidatePath("/vendas");
  revalidatePath("/fiados");
  redirect(`/vendas/${data}`);
}
