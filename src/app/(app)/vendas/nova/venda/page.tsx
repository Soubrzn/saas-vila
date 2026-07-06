import { ArrowLeft, PackagePlus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StandardSaleForm } from "@/components/sales/standard-sale-form";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type NewStandardSalePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewStandardSalePage({
  searchParams,
}: NewStandardSalePageProps) {
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

  const products = productsResponse.data ?? [];

  return (
    <>
      <PageHeader
        title="Venda"
        action={
          <Link
            href="/vendas/nova"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft data-icon="inline-start" />
            Opcoes
          </Link>
        }
      />
      <div className="p-4 sm:p-6">
        {products.length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              icon={PackagePlus}
              title="Cadastre produtos antes da venda"
            />
            <Link href="/produtos/novo" className={buttonVariants()}>
              Adicionar produto
            </Link>
          </div>
        ) : (
          <StandardSaleForm
            mode="sale"
            error={params.error}
            products={products}
            customers={customersResponse.data ?? []}
          />
        )}
      </div>
    </>
  );
}
