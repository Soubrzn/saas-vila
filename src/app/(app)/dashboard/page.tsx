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
  const salesByDay = new Map<string, { total: number; count: number }>();

  weeklySales.forEach((sale) => {
    const key = dateKey(new Date(sale.sold_at));
    const current = salesByDay.get(key) ?? { total: 0, count: 0 };

    salesByDay.set(key, {
      total: current.total + Number(sale.total ?? 0),
      count: current.count + 1,
    });
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
    const daySales = salesByDay.get(key) ?? { total: 0, count: 0 };

    return {
      key,
      label: chartLabel(date),
      total: daySales.total,
      count: daySales.count,
    };
  });

  const todaySales = salesByDay.get(dateKey(today)) ?? { total: 0, count: 0 };
  const dailyTotal = todaySales.total;
  const dailyCount = todaySales.count;
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
      <div className="space-y-6 p-4 sm:p-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_70px_-45px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(52,211,153,0.28),transparent_24rem),radial-gradient(circle_at_88%_10%,rgba(56,189,248,0.2),transparent_22rem)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-200">
                Hoje
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl">
                {shop.name}
              </h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-sm text-white/60">Caixa do dia</p>
              <p className="mt-2 text-4xl font-semibold">
                {formatCurrency(dailyTotal)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {dailyCount} venda(s)
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Vendas do dia"
            value={formatCurrency(dailyTotal)}
            helper={`${dailyCount} venda(s)`}
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
            todayCount={dailyCount}
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
