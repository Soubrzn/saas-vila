import { notFound } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireCurrentShop } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/server";

type SaleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = await params;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const [{ data: sale }, { data: items }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, payment_type, subtotal, discount_total, total, sold_at, customers(name)")
      .eq("shop_id", shop.id)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("sale_items")
      .select("id, quantity, unit_price, total_price, products(name)")
      .eq("shop_id", shop.id)
      .eq("sale_id", id),
  ]);

  if (!sale) {
    notFound();
  }

  const customer = Array.isArray(sale.customers)
    ? sale.customers[0] ?? null
    : sale.customers;

  return (
    <>
      <PageHeader
        title={`Venda #${sale.id.slice(0, 8)}`}
        description={new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(sale.sold_at))}
      />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Unitario</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items ?? []).map((item) => {
                const product = Array.isArray(item.products)
                  ? item.products[0] ?? null
                  : item.products;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {product?.name ?? "Produto"}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell>{formatCurrency(item.total_price)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span>{customer?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span>{formatCurrency(sale.discount_total)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
