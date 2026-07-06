import { PackagePlus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { StockBadge } from "@/components/products/stock-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";

export type ProductRow = {
  id: string;
  name: string;
  cost_price: string | number;
  sale_price: string | number;
  current_stock: number;
  minimum_stock: number;
};

type ProductsTableProps = {
  products: ProductRow[];
};

export function ProductsTable({ products }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackagePlus}
        title="Nenhum produto cadastrado"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Venda</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{formatCurrency(product.cost_price)}</TableCell>
              <TableCell>{formatCurrency(product.sale_price)}</TableCell>
              <TableCell>
                {product.current_stock} / min. {product.minimum_stock}
              </TableCell>
              <TableCell>
                <StockBadge
                  current={product.current_stock}
                  minimum={product.minimum_stock}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
