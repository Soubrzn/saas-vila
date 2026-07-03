"use server";

import { redirect } from "next/navigation";

import { formString, redirectWithParams } from "@/actions/utils";
import { createClient } from "@/lib/supabase/server";

export async function createShopAction(formData: FormData) {
  const name = formString(formData, "name");
  const supabase = await createClient();

  if (name.length < 2) {
    redirect(
      redirectWithParams("/cadastro-loja", {
        error: "Informe o nome da loja.",
      }),
    );
  }

  const { error } = await supabase.rpc("create_shop_for_current_user", {
    p_name: name,
  });

  if (error) {
    redirect(
      redirectWithParams("/cadastro-loja", {
        error: error.message,
      }),
    );
  }

  redirect("/dashboard");
}
