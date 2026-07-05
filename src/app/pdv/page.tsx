import { ArrowLeft, MonitorUp, PackagePlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { DbSetupRequired } from "@/components/layout/db-setup-required";
import { SaleForm } from "@/components/sales/sale-form";
import { buttonVariants } from "@/components/ui/button";
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
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#f8fafc,#eefdf7_44%,#eef6ff)] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.85)] backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300 shadow-[0_18px_35px_-22px_rgba(15,23,42,0.9)]">
            <MonitorUp className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {context.shop.name}
            </p>
            <p className="text-xs text-muted-foreground">PDV externo</p>
          </div>
        </div>
        <Link
          href="/vendas"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft data-icon="inline-start" />
          Vendas
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mx-auto max-w-3xl pt-8">
          <EmptyState
            icon={PackagePlus}
            title="Cadastre produtos antes da venda"
            description="Cadastre os produtos e use Estoque para lancar compras ou ajustes de entrada."
          />
        </div>
      ) : (
        <SaleForm
          error={params.error}
          products={products}
          customers={customersResponse.data ?? []}
        />
      )}
    </main>
  );
}
