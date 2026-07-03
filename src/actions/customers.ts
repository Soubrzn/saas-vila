"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formString, redirectWithParams } from "@/actions/utils";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validators/customer";

export async function createCustomerAction(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formString(formData, "name"),
    phone: formString(formData, "phone"),
    notes: formString(formData, "notes"),
  });

  if (!parsed.success) {
    redirect(
      redirectWithParams("/clientes/novo", {
        error: parsed.error.issues[0]?.message ?? "Revise os dados do cliente.",
      }),
    );
  }

  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    ...parsed.data,
    shop_id: shop.id,
  });

  if (error) {
    redirect(
      redirectWithParams("/clientes/novo", {
        error: error.message,
      }),
    );
  }

  revalidatePath("/clientes");
  redirect(
    redirectWithParams("/clientes", {
      message: "Cliente cadastrado.",
    }),
  );
}
