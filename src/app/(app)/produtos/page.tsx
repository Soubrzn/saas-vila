import { Plus, Search } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { StatusMessage } from "@/components/common/status-message";
import { ProductsTable } from "@/components/products/products-table";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ProductsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const query = params.q?.trim() ?? "";
  let productsQuery = supabase
    .from("products")
    .select("id, name, cost_price, sale_price, current_stock, minimum_stock")
    .eq("shop_id", shop.id)
    .eq("active", true);

  if (query) {
    productsQuery = productsQuery.ilike("name", `%${query}%`);
  }

  const { data: products } = await productsQuery.order("name");

  return (
    <>
      <PageHeader
        title="Produtos"
        action={
          <Link
            href="/produtos/novo"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus data-icon="inline-start" />
            Adicionar produto
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <StatusMessage error={params.error} message={params.message} />
        <form className="flex max-w-xl items-center gap-2 rounded-3xl border bg-white/70 px-3 py-2 shadow-sm backdrop-blur-xl">
          <Search className="size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Buscar produto"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </form>
        <ProductsTable products={products ?? []} />
      </div>
    </>
  );
}
