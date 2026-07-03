import { PageHeader } from "@/components/common/page-header";
import { StatusMessage } from "@/components/common/status-message";
import { DebtsTable } from "@/components/debts/debts-table";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type DebtsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function DebtsPage({ searchParams }: DebtsPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const { data: debts } = await supabase
    .from("customer_debts")
    .select("id, amount, paid_amount, created_at, customers(name)")
    .eq("shop_id", shop.id)
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const rows = (debts ?? []).map((debt) => ({
    ...debt,
    customers: Array.isArray(debt.customers)
      ? debt.customers[0] ?? null
      : debt.customers,
  }));

  return (
    <>
      <PageHeader
        title="Fiados"
        description="Dividas abertas por cliente e abatimentos."
      />
      <div className="space-y-4 p-4 sm:p-6">
        <StatusMessage error={params.error} message={params.message} />
        <DebtsTable debts={rows} />
      </div>
    </>
  );
}
