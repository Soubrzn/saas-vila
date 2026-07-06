import { ArrowDownCircle, ArrowUpCircle, RotateCw } from "lucide-react";

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

export type StockMovementRow = {
  id: string;
  movement_type: string;
  quantity_change: number;
  stock_after: number;
  notes: string | null;
  created_at: string;
  products: { name: string } | null;
};

function movementLabel(movement: StockMovementRow) {
  if (movement.movement_type === "sale") {
    return "Venda";
  }

  if (movement.movement_type === "purchase") {
    return "Compra";
  }

  return movement.quantity_change > 0 ? "Ajuste entrada" : "Ajuste saida";
}

type StockMovementsTableProps = {
  movements: StockMovementRow[];
};

export function StockMovementsTable({ movements }: StockMovementsTableProps) {
  if (movements.length === 0) {
    return (
      <EmptyState
        icon={RotateCw}
        title="Sem registros"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.75)] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Qtd.</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Obs.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const isEntry = movement.quantity_change > 0;
            const Icon = isEntry ? ArrowUpCircle : ArrowDownCircle;

            return (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(movement.created_at))}
                </TableCell>
                <TableCell className="font-medium">
                  {movement.products?.name ?? "Produto"}
                </TableCell>
                <TableCell>
                  <Badge variant={isEntry ? "secondary" : "outline"}>
                    {movementLabel(movement)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <Icon className="size-4 text-muted-foreground" />
                    {movement.quantity_change > 0 ? "+" : ""}
                    {movement.quantity_change}
                  </span>
                </TableCell>
                <TableCell>{movement.stock_after}</TableCell>
                <TableCell className="max-w-56 truncate">
                  {movement.notes || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
