import { ReceiptText } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

type OpenDebt = {
  id: string;
  amount: string | number;
  paid_amount: string | number;
  customers: { name: string } | null;
};

type OpenDebtsCardProps = {
  debts: OpenDebt[];
};

export function OpenDebtsCard({ debts }: OpenDebtsCardProps) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Fiados em aberto</CardTitle>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Nenhum fiado em aberto"
            description="Vendas marcadas como fiado entram automaticamente nesta lista."
          />
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => {
              const openAmount = Number(debt.amount) - Number(debt.paid_amount);

              return (
                <Link
                  key={debt.id}
                  href="/fiados"
                  className="flex items-center justify-between rounded-2xl border bg-white/60 px-3 py-3 text-sm transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  <span className="font-medium">
                    {debt.customers?.name ?? "Cliente"}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(openAmount)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
