import {
  AlertTriangle,
  Banknote,
  Gem,
  HandCoins,
  ReceiptText,
} from "lucide-react";

import { LowStockCard } from "@/components/dashboard/low-stock-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OpenDebtsCard } from "@/components/dashboard/open-debts-card";
import { RecentSalesCard } from "@/components/dashboard/recent-sales-card";
import { SalesPulseChart } from "@/components/dashboard/sales-pulse-chart";
import { PageHeader } from "@/components/common/page-header";
import { requireCurrentShop } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function chartLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default async function DashboardPage() {
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const chartStart = new Date(today);
  chartStart.setDate(chartStart.getDate() - 6);

  const [
    weeklySalesResponse,
    recentSalesResponse,
    productsResponse,
    debtsResponse,
  ] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, sold_at")
      .eq("shop_id", shop.id)
      .gte("sold_at", chartStart.toISOString())
      .lt("sold_at", tomorrow.toISOString()),
    supabase
      .from("sales")
      .select("id, payment_type, total, sold_at, customers(name)")
      .eq("shop_id", shop.id)
      .order("sold_at", { ascending: false })
      .limit(6),
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

  const weeklySales = weeklySalesResponse.data ?? [];
  const sales = weeklySales.filter((sale) => {
    const soldAt = new Date(sale.sold_at);

    return soldAt >= today && soldAt < tomorrow;
  });
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
  const recentSales = (recentSalesResponse.data ?? []).map((sale) => ({
    ...sale,
    customers: Array.isArray(sale.customers)
      ? sale.customers[0] ?? null
      : sale.customers,
  }));
  const salesPulse = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(chartStart);
    date.setDate(chartStart.getDate() + index);
    const key = dateKey(date);
    const daySales = weeklySales.filter(
      (sale) => dateKey(new Date(sale.sold_at)) === key,
    );

    return {
      key,
      label: chartLabel(date),
      total: daySales.reduce(
        (sum, sale) => sum + Number(sale.total ?? 0),
        0,
      ),
      count: daySales.length,
    };
  });

  const dailyTotal = sales.reduce(
    (sum, sale) => sum + Number(sale.total ?? 0),
    0,
  );
  const estimatedProfit = dailyTotal * 0.28;
  const openDebtTotal = debts.reduce(
    (sum, debt) => sum + Number(debt.amount) - Number(debt.paid_amount),
    0,
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
      />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Vendas do dia"
            value={formatCurrency(dailyTotal)}
            helper={`${sales.length} venda(s)`}
            icon={Banknote}
            tone="emerald"
          />
          <MetricCard
            title="Lucro estimado"
            value={formatCurrency(estimatedProfit)}
            helper="28% do total"
            icon={Gem}
            tone="cyan"
          />
          <MetricCard
            title="Estoque baixo"
            value={String(lowStock.length)}
            helper="Itens"
            icon={AlertTriangle}
            tone="amber"
          />
          <MetricCard
            title="Fiados em aberto"
            value={formatCurrency(openDebtTotal)}
            helper={`${debts.length} cliente(s)`}
            icon={HandCoins}
            tone="violet"
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <SalesPulseChart
            points={salesPulse}
            todayTotal={dailyTotal}
            todayCount={sales.length}
          />
          <RecentSalesCard sales={recentSales} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <LowStockCard products={lowStock} />
          <OpenDebtsCard debts={debts.slice(0, 6)} />
        </div>
        {weeklySalesResponse.error ||
        recentSalesResponse.error ||
        productsResponse.error ||
        debtsResponse.error ? (
          <div className="flex items-start gap-2 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            <ReceiptText className="mt-0.5 size-4" />
            <span>
              Confira as migrations no Supabase.
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}
