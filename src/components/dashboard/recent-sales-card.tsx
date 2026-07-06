import { ReceiptText } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

type RecentSale = {
  id: string;
  payment_type: string;
  total: string | number;
  sold_at: string;
  customers: { name: string } | null;
};

type RecentSalesCardProps = {
  sales: RecentSale[];
};

const paymentLabels: Record<string, string> = {
  cash: "Dinheiro",
  pix: "Pix",
  card: "Cartao",
  credit: "Fiado",
};

export function RecentSalesCard({ sales }: RecentSalesCardProps) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Ultimas vendas</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Nenhuma venda"
          />
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <Link
                key={sale.id}
                href={`/vendas/${sale.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-white/60 px-3 py-3 text-sm transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{sale.id.slice(0, 8)}</span>
                    <Badge
                      variant={
                        sale.payment_type === "credit" ? "outline" : "secondary"
                      }
                    >
                      {paymentLabels[sale.payment_type] ?? sale.payment_type}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {sale.customers?.name ?? "Sem cliente"} -{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(sale.sold_at))}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">
                  {formatCurrency(sale.total)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
