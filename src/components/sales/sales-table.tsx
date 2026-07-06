import { Plus, ReceiptText } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";

export type SaleRow = {
  id: string;
  payment_type: string;
  total: string | number;
  sold_at: string;
  customers: { name: string } | null;
};

const paymentLabels: Record<string, string> = {
  cash: "Dinheiro",
  pix: "Pix",
  card: "Cartao",
  credit: "Fiado",
};

type SalesTableProps = {
  sales: SaleRow[];
};

export function SalesTable({ sales }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Nenhuma venda registrada"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venda</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                <Link href={`/vendas/${sale.id}`} className="hover:underline">
                  #{sale.id.slice(0, 8)}
                </Link>
              </TableCell>
              <TableCell>{sale.customers?.name ?? "-"}</TableCell>
              <TableCell>
                <Badge
                  variant={sale.payment_type === "credit" ? "outline" : "secondary"}
                >
                  {paymentLabels[sale.payment_type] ?? sale.payment_type}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(sale.total)}</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(sale.sold_at))}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/vendas/${sale.id}`}
                  aria-label={`Abrir venda ${sale.id.slice(0, 8)}`}
                  title="Abrir venda"
                  className={buttonVariants({
                    variant: "outline",
                    size: "icon-sm",
                  })}
                >
                  <Plus />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
