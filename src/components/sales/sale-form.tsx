"use client";

import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { registerSaleAction } from "@/actions/sales";
import { StatusMessage } from "@/components/common/status-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export type SaleProductOption = {
  id: string;
  name: string;
  sale_price: string | number;
  current_stock: number;
};

export type SaleCustomerOption = {
  id: string;
  name: string;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type CartRow = CartItem & {
  product: SaleProductOption;
  unitPrice: number;
  total: number;
};

type SaleFormProps = {
  products: SaleProductOption[];
  customers: SaleCustomerOption[];
  error?: string;
};

const paymentOptions = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "card", label: "Cartao", icon: CreditCard },
  { value: "credit", label: "Fiado", icon: ShoppingCart },
];

function numberValue(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export function SaleForm({ products, customers, error }: SaleFormProps) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  }, [products, query]);

  const cartRows = cart
    .map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        return null;
      }

      const unitPrice = numberValue(product.sale_price);

      return {
        ...item,
        product,
        unitPrice,
        total: unitPrice * item.quantity,
      };
    })
    .filter((item): item is CartRow => item !== null);

  const subtotal = cartRows.reduce((sum, item) => sum + item.total, 0);
  const discountNumber = Number(discount.replace(",", ".")) || 0;
  const total = Math.max(subtotal - discountNumber, 0);
  const itemsPayload = JSON.stringify(
    cartRows.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    })),
  );

  function addProduct(productId: string) {
    const product = productsById.get(productId);

    if (!product) {
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);

      if (!existing) {
        return [...current, { productId, quantity: 1 }];
      }

      if (existing.quantity >= product.current_stock) {
        return current;
      }

      return current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    });
  }

  function decreaseProduct(productId: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeProduct(productId: string) {
    setCart((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }

  return (
    <form action={registerSaleAction} className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="payment_type" value={paymentType} />
      <input type="hidden" name="customer_id" value={customerId} />

      <section className="space-y-4">
        <StatusMessage error={error} />
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar produto"
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const item = cart.find((row) => row.productId === product.id);
            const available = product.current_stock - (item?.quantity ?? 0);

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product.id)}
                disabled={available <= 0}
                className="min-h-28 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="line-clamp-2 text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Estoque {product.current_stock}
                    </p>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(product.sale_price)}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs">
                      + item
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="xl:sticky xl:top-4 xl:self-start">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Cupom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-48 space-y-2">
              {cartRows.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                  <ShoppingCart className="mb-2 size-6" />
                  Carrinho vazio
                </div>
              ) : (
                cartRows.map((item) => (
                  <div
                    key={item.product.id}
                    className="rounded-lg border bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} cada
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeProduct(item.product.id)}
                        aria-label="Remover item"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => decreaseProduct(item.product.id)}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus />
                        </Button>
                        <span className="flex h-7 w-10 items-center justify-center rounded-lg border text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => addProduct(item.product.id)}
                          aria-label="Aumentar quantidade"
                          disabled={item.quantity >= item.product.current_stock}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const active = paymentType === option.value;

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={active ? "default" : "outline"}
                    onClick={() => setPaymentType(option.value)}
                    className={cn("justify-start", active && "shadow-sm")}
                  >
                    <Icon data-icon="inline-start" />
                    {option.label}
                  </Button>
                );
              })}
            </div>

            {paymentType === "credit" ? (
              <div className="space-y-2">
                <Label htmlFor="customer-select">Cliente</Label>
                <select
                  id="customer-select"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  required
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Selecione</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="discount_total">Desconto</Label>
                <Input
                  id="discount_total"
                  name="discount_total"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" className="min-h-10" />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Desconto</span>
                <span>{formatCurrency(discountNumber)}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={cartRows.length === 0}
            >
              Finalizar venda
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
