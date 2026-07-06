import { HandCoins } from "lucide-react";

import { registerDebtPaymentAction } from "@/actions/debts";
import { EmptyState } from "@/components/common/empty-state";
import { SubmitButton } from "@/components/common/submit-button";
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
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-white/75 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Em aberto</TableHead>
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
                    <SubmitButton
                      type="submit"
                      variant="outline"
                      size="sm"
                      pendingLabel="Registrando..."
                    >
                      Registrar
                    </SubmitButton>
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
