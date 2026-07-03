import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { StatusMessage } from "@/components/common/status-message";
import { ProductsTable } from "@/components/products/products-table";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ProductsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, cost_price, sale_price, current_stock, minimum_stock")
    .eq("shop_id", shop.id)
    .eq("active", true)
    .order("name");

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro e acompanhamento de estoque."
        action={
          <Link
            href="/produtos/novo"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus data-icon="inline-start" />
            Novo
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <StatusMessage error={params.error} message={params.message} />
        <ProductsTable products={products ?? []} />
      </div>
    </>
  );
}
