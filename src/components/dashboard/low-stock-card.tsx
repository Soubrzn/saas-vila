import { PackageX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LowStockProduct = {
  id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
};

type LowStockCardProps = {
  products: LowStockProduct[];
};

export function LowStockCard({ products }: LowStockCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Estoque baixo</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="Nenhum produto abaixo do minimo"
            description="Quando o estoque atual ficar igual ou abaixo do minimo, ele aparece aqui."
          />
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href="/produtos"
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">
                  {product.current_stock} / min. {product.minimum_stock}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
