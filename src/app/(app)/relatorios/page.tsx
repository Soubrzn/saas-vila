import { Banknote, ChartNoAxesCombined, HandCoins, PackageCheck } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesPulseChart } from "@/components/dashboard/sales-pulse-chart";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

const reportPeriods = [
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
  { key: "month", label: "Mes atual", days: null },
] as const;

type ReportPeriodKey = (typeof reportPeriods)[number]["key"];

type ReportsPageProps = {
  searchParams: Promise<{
    period?: string;
  }>;
};

function parseReportPeriod(value: string | undefined): ReportPeriodKey {
  return reportPeriods.some((period) => period.key === value)
    ? (value as ReportPeriodKey)
    : "month";
}

function periodStartDate(periodKey: ReportPeriodKey) {
  const now = new Date();
  const period = reportPeriods.find((item) => item.key === periodKey);

  if (period?.days) {
    const start = new Date(now);
    start.setDate(start.getDate() - period.days + 1);
    start.setHours(0, 0, 0, 0);

    return start;
  }

  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return monthStart;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const periodKey = parseReportPeriod(params.period);
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const startDate = periodStartDate(periodKey);

  const [salesResponse, debtsResponse, productsResponse] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total")
      .eq("shop_id", shop.id)
      .gte("sold_at", startDate.toISOString()),
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
        action={
          <div className="flex flex-wrap gap-2">
            {reportPeriods.map((period) => (
              <Link
                key={period.key}
                href={
                  period.key === "month"
                    ? "/relatorios"
                    : `/relatorios?period=${period.key}`
                }
                className={buttonVariants({
                  variant: period.key === periodKey ? "default" : "outline",
                  size: "sm",
                })}
              >
                {period.label}
              </Link>
            ))}
          </div>
        }
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Vendas no mes"
            value={formatCurrency(monthlyTotal)}
            helper={`${monthlySales.length} venda(s)`}
            icon={Banknote}
            tone="emerald"
          />
          <MetricCard
            title="Lucro estimado"
            value={formatCurrency(monthlyTotal * 0.28)}
            helper="28% do total"
            icon={ChartNoAxesCombined}
            tone="cyan"
          />
          <MetricCard
            title="Fiados abertos"
            value={formatCurrency(openDebtTotal)}
            helper={`${openDebts.length} cliente(s)`}
            icon={HandCoins}
            tone="violet"
          />
          <MetricCard
            title="Estoque baixo"
            value={String(lowStockCount)}
            helper="Itens"
            icon={PackageCheck}
            tone="amber"
          />
        </div>
        <SalesPulseChart total={monthlyTotal} count={monthlySales.length} />
      </div>
    </>
  );
}
