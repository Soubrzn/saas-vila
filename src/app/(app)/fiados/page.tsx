import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { StatusMessage } from "@/components/common/status-message";
import { DebtsTable } from "@/components/debts/debts-table";
import { requireCurrentShop } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

type DebtsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    page?: string;
  }>;
};

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const { data: debts, count } = await supabase
    .from("customer_debts")
    .select("id, amount, paid_amount, created_at, customers(name)", {
      count: "exact",
    })
    .eq("shop_id", shop.id)
    .eq("status", "open")
    .order("created_at", { ascending: true })
    .range(from, to);

  const rows = (debts ?? []).map((debt) => ({
    ...debt,
    customers: Array.isArray(debt.customers)
      ? debt.customers[0] ?? null
      : debt.customers,
  }));

  return (
    <>
      <PageHeader title="Fiados" />
      <div className="space-y-4 p-4 sm:p-6">
        <StatusMessage error={params.error} message={params.message} />
        <DebtsTable debts={rows} />
        <PaginationControls
          basePath="/fiados"
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalCount={count ?? 0}
        />
      </div>
    </>
  );
}
