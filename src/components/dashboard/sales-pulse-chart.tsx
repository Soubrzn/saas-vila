import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

type SalesPulseChartProps = {
  total: number;
  count: number;
};

const bars = [38, 58, 42, 74, 50, 88, 64];

export function SalesPulseChart({ total, count }: SalesPulseChartProps) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Ritmo de vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-2 rounded-3xl bg-slate-950 p-4">
          {bars.map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-cyan-300 shadow-[0_0_24px_rgba(45,212,191,0.22)]"
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] text-white/45">{index + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/70 p-3">
            <p className="text-xs text-muted-foreground">Hoje</p>
            <p className="text-lg font-semibold">{formatCurrency(total)}</p>
          </div>
          <div className="rounded-2xl bg-muted/70 p-3">
            <p className="text-xs text-muted-foreground">Vendas</p>
            <p className="text-lg font-semibold">{count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
