import {
  AlertTriangle,
  Banknote,
  HandCoins,
  ReceiptText,
} from "lucide-react";

import { LowStockCard } from "@/components/dashboard/low-stock-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OpenDebtsCard } from "@/components/dashboard/open-debts-card";
import { PageHeader } from "@/components/common/page-header";
import { requireCurrentShop } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [salesResponse, productsResponse, debtsResponse] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total")
      .eq("shop_id", shop.id)
      .gte("sold_at", today.toISOString())
      .lt("sold_at", tomorrow.toISOString()),
    supabase
      .from("products")
      .select("id, name, current_stock, minimum_stock")
      .eq("shop_id", shop.id)
      .eq("active", true)
      .order("name"),
    supabase
      .from("customer_debts")
      .select("id, amount, paid_amount, customers(name)")
      .eq("shop_id", shop.id)
      .eq("status", "open")
      .order("created_at", { ascending: true }),
  ]);

  const sales = salesResponse.data ?? [];
  const products = productsResponse.data ?? [];
  const lowStock = products
    .filter((product) => product.current_stock <= product.minimum_stock)
    .slice(0, 6);
  const debts = (debtsResponse.data ?? []).map((debt) => ({
    ...debt,
    customers: Array.isArray(debt.customers)
      ? debt.customers[0] ?? null
      : debt.customers,
  }));

  const dailyTotal = sales.reduce(
    (sum, sale) => sum + Number(sale.total ?? 0),
    0,
  );
  const openDebtTotal = debts.reduce(
    (sum, debt) => sum + Number(debt.amount) - Number(debt.paid_amount),
    0,
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumo operacional da loja hoje."
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Vendas do dia"
            value={formatCurrency(dailyTotal)}
            helper={`${sales.length} venda(s) registradas`}
            icon={Banknote}
          />
          <MetricCard
            title="Estoque baixo"
            value={String(lowStock.length)}
            helper="Produtos no minimo ou abaixo"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Fiados em aberto"
            value={formatCurrency(openDebtTotal)}
            helper={`${debts.length} divida(s) abertas`}
            icon={HandCoins}
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <LowStockCard products={lowStock} />
          <OpenDebtsCard debts={debts.slice(0, 6)} />
        </div>
        {salesResponse.error || productsResponse.error || debtsResponse.error ? (
          <div className="flex items-start gap-2 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            <ReceiptText className="mt-0.5 size-4" />
            <span>
              Se algum bloco estiver vazio apos criar a loja, confira se a
              migration foi rodada no Supabase.
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}
