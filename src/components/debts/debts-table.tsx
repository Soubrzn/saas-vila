import { HandCoins } from "lucide-react";

import { registerDebtPaymentAction } from "@/actions/debts";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";

export type DebtRow = {
  id: string;
  amount: string | number;
  paid_amount: string | number;
  created_at: string;
  customers: { name: string } | null;
};

type DebtsTableProps = {
  debts: DebtRow[];
};

export function DebtsTable({ debts }: DebtsTableProps) {
  if (debts.length === 0) {
    return (
      <EmptyState
        icon={HandCoins}
        title="Nenhum fiado em aberto"
        description="Quando uma venda fiado for registrada, a divida aparecera aqui."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor aberto</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead>Pagamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.map((debt) => {
            const openAmount = Number(debt.amount) - Number(debt.paid_amount);

            return (
              <TableRow key={debt.id}>
                <TableCell className="font-medium">
                  {debt.customers?.name ?? "Cliente"}
                </TableCell>
                <TableCell>{formatCurrency(openAmount)}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("pt-BR").format(
                    new Date(debt.created_at),
                  )}
                </TableCell>
                <TableCell>
                  <form
                    action={registerDebtPaymentAction}
                    className="flex max-w-xs items-center gap-2"
                  >
                    <input type="hidden" name="debt_id" value={debt.id} />
                    <input type="hidden" name="payment_type" value="cash" />
                    <Input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Valor"
                      className="w-28"
                      required
                    />
                    <Button type="submit" variant="outline" size="sm">
                      Abater
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
