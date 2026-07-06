import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { SalesTable } from "@/components/sales/sales-table";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

type SalesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const { data: sales, count } = await supabase
    .from("sales")
    .select("id, payment_type, total, sold_at, customers(name)", {
      count: "exact",
    })
    .eq("shop_id", shop.id)
    .order("sold_at", { ascending: false })
    .range(from, to);

  const rows = (sales ?? []).map((sale) => ({
    ...sale,
    customers: Array.isArray(sale.customers)
      ? sale.customers[0] ?? null
      : sale.customers,
  }));

  return (
    <>
      <PageHeader
        title="Vendas"
        action={
          <>
            <Link
              href="/pdv"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              PDV
            </Link>
            <Link
              href="/vendas/nova"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus data-icon="inline-start" />
              Nova venda
            </Link>
          </>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <SalesTable sales={rows} />
        <PaginationControls
          basePath="/vendas"
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalCount={count ?? 0}
        />
      </div>
    </>
  );
}
