import { PackagePlus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SaleForm } from "@/components/sales/sale-form";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type NewSalePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewSalePage({ searchParams }: NewSalePageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const [productsResponse, customersResponse] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, sale_price, current_stock")
      .eq("shop_id", shop.id)
      .eq("active", true)
      .order("name"),
    supabase
      .from("customers")
      .select("id, name")
      .eq("shop_id", shop.id)
      .order("name"),
  ]);

  return (
    <>
      <PageHeader
        title="PDV"
        description="Venda de balcao com carrinho, atalhos e baixa automatica de estoque."
      />
      <div className="p-4 sm:p-6">
        {(productsResponse.data ?? []).length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              icon={PackagePlus}
              title="Cadastre produtos antes da venda"
              description="Cadastre os produtos e use Estoque para lancar compras ou ajustes de entrada."
            />
            <Link href="/produtos/novo" className={buttonVariants()}>
              Cadastrar produto
            </Link>
          </div>
        ) : (
          <SaleForm
            error={params.error}
            products={productsResponse.data ?? []}
            customers={customersResponse.data ?? []}
          />
        )}
      </div>
    </>
  );
}
