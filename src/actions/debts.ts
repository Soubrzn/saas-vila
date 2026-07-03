"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formNumber, formString, redirectWithParams } from "@/actions/utils";
import { createClient } from "@/lib/supabase/server";

export async function registerDebtPaymentAction(formData: FormData) {
  const supabase = await createClient();
  const debtId = formString(formData, "debt_id");
  const amount = formNumber(formData, "amount");
  const paymentType = formString(formData, "payment_type") || "cash";
  const notes = formString(formData, "notes");

  const { error } = await supabase.rpc("register_debt_payment", {
    p_debt_id: debtId,
    p_amount: amount,
    p_payment_type: paymentType,
    p_notes: notes || null,
  });

  if (error) {
    redirect(
      redirectWithParams("/fiados", {
        error: error.message,
      }),
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/fiados");
  redirect(
    redirectWithParams("/fiados", {
      message: "Pagamento registrado.",
    }),
  );
}
