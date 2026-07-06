import { PackagePlus } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { DbSetupRequired } from "@/components/layout/db-setup-required";
import { SaleForm } from "@/components/sales/sale-form";
import { getCurrentContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ExternalPdvPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ExternalPdvPage({
  searchParams,
}: ExternalPdvPageProps) {
  const params = await searchParams;
  const context = await getCurrentContext();

  if (!context.user) {
    redirect("/login");
  }

  if (context.dbError) {
    return <DbSetupRequired error={context.dbError} />;
  }

  if (!context.shop) {
    redirect("/cadastro-loja");
  }

  const supabase = await createClient();
  const [productsResponse, customersResponse] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sale_price, current_stock")
      .eq("shop_id", context.shop.id)
      .eq("active", true)
      .order("name"),
    supabase
      .from("customers")
      .select("id, name")
      .eq("shop_id", context.shop.id)
      .order("name"),
  ]);

  const products = productsResponse.data ?? [];

  return (
    <main className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#f8fafc,#eefdf7_44%,#eef6ff)]">
      {products.length === 0 ? (
        <div className="mx-auto max-w-3xl pt-8">
          <EmptyState
            icon={PackagePlus}
            title="Cadastre produtos antes da venda"
          />
        </div>
      ) : (
        <SaleForm
          error={params.error}
          products={products}
          customers={customersResponse.data ?? []}
          fullscreen
          returnTo="/pdv"
        />
      )}
    </main>
  );
}
