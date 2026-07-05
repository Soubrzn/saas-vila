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
import { SalesPulseChart } from "@/components/dashboard/sales-pulse-chart";
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
  const estimatedProfit = dailyTotal * 0.28;
  const openDebtTotal = debts.reduce(
    (sum, debt) => sum + Number(debt.amount) - Number(debt.paid_amount),
    0,
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Um painel direto para entender caixa, estoque e fiado sem perder tempo no balcao."
      />
      <div className="space-y-6 p-4 sm:p-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_70px_-45px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(52,211,153,0.28),transparent_24rem),radial-gradient(circle_at_88%_10%,rgba(56,189,248,0.2),transparent_22rem)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-200">
                operacao de hoje
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl">
                {shop.name} vendendo com clareza, estoque e fiado sob controle.
              </h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-sm text-white/60">Caixa do dia</p>
              <p className="mt-2 text-4xl font-semibold">
                {formatCurrency(dailyTotal)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {sales.length} venda(s) registradas ate agora
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Vendas do dia"
            value={formatCurrency(dailyTotal)}
            helper={`${sales.length} venda(s) registradas`}
            icon={Banknote}
            tone="emerald"
          />
          <MetricCard
            title="Lucro estimado"
            value={formatCurrency(estimatedProfit)}
            helper="Estimativa visual para acompanhar margem"
            icon={Gem}
            tone="cyan"
          />
          <MetricCard
            title="Estoque baixo"
            value={String(lowStock.length)}
            helper="Produtos no minimo ou abaixo"
            icon={AlertTriangle}
            tone="amber"
          />
          <MetricCard
            title="Fiados em aberto"
            value={formatCurrency(openDebtTotal)}
            helper={`${debts.length} divida(s) abertas`}
            icon={HandCoins}
            tone="violet"
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
          <SalesPulseChart total={dailyTotal} count={sales.length} />
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
