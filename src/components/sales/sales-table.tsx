import { ReceiptText } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
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
        description="As vendas aparecem aqui depois de registradas no caixa."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-white/75 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venda</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Data</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
