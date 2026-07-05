import { Banknote, ChartNoAxesCombined, HandCoins, PackageCheck } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesPulseChart } from "@/components/dashboard/sales-pulse-chart";
import { requireCurrentShop } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [salesResponse, debtsResponse, productsResponse] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total")
      .eq("shop_id", shop.id)
      .gte("sold_at", monthStart.toISOString()),
    supabase
      .from("customer_debts")
      .select("id, amount, paid_amount")
      .eq("shop_id", shop.id)
      .eq("status", "open"),
    supabase
      .from("products")
      .select("id, current_stock, minimum_stock")
      .eq("shop_id", shop.id)
      .eq("active", true),
  ]);

  const monthlySales = salesResponse.data ?? [];
  const openDebts = debtsResponse.data ?? [];
  const products = productsResponse.data ?? [];
  const monthlyTotal = monthlySales.reduce(
    (sum, sale) => sum + Number(sale.total ?? 0),
    0,
  );
  const openDebtTotal = openDebts.reduce(
    (sum, debt) => sum + Number(debt.amount) - Number(debt.paid_amount),
    0,
  );
  const lowStockCount = products.filter(
    (product) => product.current_stock <= product.minimum_stock,
  ).length;

  return (
    <>
      <PageHeader
        title="Relatorios"
        description="Resumo financeiro simples para entender o mes, o caixa e os pontos de atencao."
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Vendas no mes"
            value={formatCurrency(monthlyTotal)}
            helper={`${monthlySales.length} venda(s) no periodo`}
            icon={Banknote}
            tone="emerald"
          />
          <MetricCard
            title="Lucro estimado"
            value={formatCurrency(monthlyTotal * 0.28)}
            helper="Base inicial para acompanhar margem"
            icon={ChartNoAxesCombined}
            tone="cyan"
          />
          <MetricCard
            title="Fiados abertos"
            value={formatCurrency(openDebtTotal)}
            helper={`${openDebts.length} divida(s) aguardando pagamento`}
            icon={HandCoins}
            tone="violet"
          />
          <MetricCard
            title="Estoque baixo"
            value={String(lowStockCount)}
            helper="Produtos no minimo ou abaixo"
            icon={PackageCheck}
            tone="amber"
          />
        </div>
        <SalesPulseChart total={monthlyTotal} count={monthlySales.length} />
      </div>
    </>
  );
}
