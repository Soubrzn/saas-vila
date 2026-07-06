import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ProductsTable } from "@/components/products/products-table";
import { StockMovementForm } from "@/components/stock/stock-movement-form";
import { StockMovementsTable } from "@/components/stock/stock-movements-table";
import { requireCurrentShop } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

type StockPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    page?: string;
  }>;
};

export default async function StockPage({ searchParams }: StockPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const [productsResponse, productOptionsResponse, movementsResponse] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, name, cost_price, sale_price, current_stock, minimum_stock",
          { count: "exact" },
        )
        .eq("shop_id", shop.id)
        .eq("active", true)
        .order("name")
        .range(from, to),
      supabase
        .from("products")
        .select("id, name, current_stock")
        .eq("shop_id", shop.id)
        .eq("active", true)
        .order("name"),
      supabase
        .from("stock_movements")
        .select(
          "id, movement_type, quantity_change, stock_after, notes, created_at, products(name)",
        )
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const products = productsResponse.data ?? [];
  const productOptions = productOptionsResponse.data ?? [];
  const movements = (movementsResponse.data ?? []).map((movement) => ({
    ...movement,
    products: Array.isArray(movement.products)
      ? movement.products[0] ?? null
      : movement.products,
  }));

  return (
    <>
      <PageHeader title="Estoque" />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ProductsTable products={products} />
          <PaginationControls
            basePath="/estoque"
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            totalCount={productsResponse.count ?? 0}
          />
          <StockMovementsTable movements={movements} />
        </div>
        <StockMovementForm
          products={productOptions.map((product) => ({
            id: product.id,
            name: product.name,
            current_stock: product.current_stock,
          }))}
          error={params.error}
          message={params.message}
        />
      </div>
    </>
  );
}
