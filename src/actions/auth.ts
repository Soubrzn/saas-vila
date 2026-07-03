"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { formString, redirectWithParams } from "@/actions/utils";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      redirectWithParams("/login", {
        error: "Email ou senha invalidos.",
      }),
    );
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const email = formString(formData, "email");
  const password = formString(formData, "password");
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/cadastro-loja`,
    },
  });

  if (error) {
    redirect(
      redirectWithParams("/login", {
        error: error.message,
      }),
    );
  }

  if (data.session) {
    redirect("/cadastro-loja");
  }

  redirect(
    redirectWithParams("/login", {
      message: "Cadastro criado. Confirme seu email para entrar.",
    }),
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
