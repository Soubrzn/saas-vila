import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export type SalesPulsePoint = {
  key: string;
  label: string;
  total: number;
  count: number;
};

type SalesPulseChartProps = {
  points?: SalesPulsePoint[];
  todayTotal?: number;
  todayCount?: number;
  total?: number;
  count?: number;
};

export function SalesPulseChart({
  points,
  todayTotal,
  todayCount,
  total,
  count,
}: SalesPulseChartProps) {
  const fallbackTotal = total ?? 0;
  const fallbackCount = count ?? 0;
  const chartPoints =
    points && points.length > 0
      ? points
      : Array.from({ length: 7 }, (_, index) => ({
          key: `fallback-${index}`,
          label: String(index + 1),
          total: index === 6 ? fallbackTotal : 0,
          count: index === 6 ? fallbackCount : 0,
        }));
  const displayedTotal = todayTotal ?? fallbackTotal;
  const displayedCount = todayCount ?? fallbackCount;
  const maxTotal = Math.max(...chartPoints.map((point) => point.total), 0);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Vendas 7 dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-stretch gap-2 rounded-lg border bg-muted/40 p-4">
          {chartPoints.map((point) => {
            const height =
              maxTotal > 0 ? Math.max(10, (point.total / maxTotal) * 100) : 0;

            return (
              <div
                key={point.key}
                className="flex h-full flex-1 flex-col justify-end gap-2"
                title={`${point.label}: ${formatCurrency(point.total)} em ${point.count} venda(s)`}
              >
                <div className="flex min-h-0 flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all",
                      point.total > 0
                        ? "bg-primary"
                        : "bg-border",
                    )}
                    style={{
                      height: point.total > 0 ? `${height}%` : "2px",
                    }}
                  />
                </div>
                <span className="text-center text-[10px] text-muted-foreground">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/70 p-3">
            <p className="text-xs text-muted-foreground">Hoje</p>
            <p className="text-lg font-semibold">
              {formatCurrency(displayedTotal)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/70 p-3">
            <p className="text-xs text-muted-foreground">Vendas</p>
            <p className="text-lg font-semibold">{displayedCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
