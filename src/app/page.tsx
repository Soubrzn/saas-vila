import { redirect } from "next/navigation";

import { getCurrentContext } from "@/lib/auth";

export default async function Home() {
  const { user, shop } = await getCurrentContext();

  if (!user) {
    redirect("/login");
  }

  if (!shop) {
    redirect("/cadastro-loja");
  }

  redirect("/dashboard");
}
