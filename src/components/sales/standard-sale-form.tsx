"use client";

import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  Printer,
  QrCode,
  ReceiptText,
  Trash2,
  UserRound,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export type StandardSaleProduct = {
  id: string;
  name: string;
  sale_price: string | number;
  current_stock: number;
};

export type StandardSaleCustomer = {
  id: string;
  name: string;
};

type StandardSaleFormProps = {
  mode: "sale" | "quote";
  products: StandardSaleProduct[];
  customers: StandardSaleCustomer[];
  error?: string;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type CartRow = CartItem & {
  product: StandardSaleProduct;
  unitPrice: number;
  total: number;
};

const paymentOptions = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "card", label: "Cartao", icon: CreditCard },
  { value: "credit", label: "Fiado", icon: UserRound },
];

function numberValue(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function StandardSaleForm({
  mode,
  products,
  customers,
  error,
}: StandardSaleFormProps) {
  const [saleRequestId] = useState(createRequestId);
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const selectedProduct = productsById.get(selectedProductId) ?? null;
  const isQuote = mode === "quote";

  const productOptions = useMemo(() => {
    return products.map((product) => (
      <option key={product.id} value={product.id}>
        {product.name} - {formatCurrency(product.sale_price)} - saldo{" "}
        {product.current_stock}
      </option>
    ));
  }, [products]);

  const customerOptions = useMemo(() => {
    return customers.map((customer) => (
      <option key={customer.id} value={customer.id}>
        {customer.name}
      </option>
    ));
  }, [customers]);

  const cartRows = useMemo(() => {
    return cart
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
  }, [cart, productsById]);

  const subtotal = useMemo(() => {
    return cartRows.reduce((sum, item) => sum + item.total, 0);
  }, [cartRows]);
  const discountNumber = Number(discount.replace(",", ".")) || 0;
  const total = Math.max(subtotal - discountNumber, 0);
  const itemsPayload = useMemo(() => {
    return JSON.stringify(
      cartRows.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    );
  }, [cartRows]);
  const canSubmit =
    cartRows.length > 0 && (paymentType !== "credit" || customerId.length > 0);

  function addSelectedProduct() {
    if (!selectedProduct) {
      return;
    }

    const parsedQuantity = Math.max(1, Number(quantity) || 1);

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === selectedProduct.id,
      );
      const existingQuantity = existing?.quantity ?? 0;
      const availableQuantity = selectedProduct.current_stock - existingQuantity;
      const allowedQuantity = isQuote
        ? parsedQuantity
        : Math.min(parsedQuantity, availableQuantity);

      if (allowedQuantity <= 0) {
        return current;
      }

      if (!existing) {
        return [
          ...current,
          { productId: selectedProduct.id, quantity: allowedQuantity },
        ];
      }

      return current.map((item) =>
        item.productId === selectedProduct.id
          ? { ...item, quantity: item.quantity + allowedQuantity }
          : item,
      );
    });
    setQuantity("1");
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

  function increaseProduct(productId: string) {
    const product = productsById.get(productId);

    if (!product) {
      return;
    }

    setCart((current) =>
      current.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (!isQuote && item.quantity >= product.current_stock) {
          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      }),
    );
  }

  function removeProduct(productId: string) {
    setCart((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (mode === "quote") {
      event.preventDefault();
      window.print();
      return;
    }

    if (isSubmitting || !canSubmit) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  }

  return (
    <form
      action={mode === "sale" ? registerSaleAction : undefined}
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <input type="hidden" name="sale_request_id" value={saleRequestId} />
      <input type="hidden" name="return_to" value="/vendas/nova/venda" />
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="payment_type" value={paymentType} />
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="discount_total" value={discount} />
      <input type="hidden" name="notes" value={notes} />

      <div className="space-y-6">
        <StatusMessage error={error} />

        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <CardTitle>{isQuote ? "Itens do orcamento" : "Itens"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]">
              <div className="space-y-2">
                <Label htmlFor="product_id">Produto</Label>
                <select
                  id="product_id"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {productOptions}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="h-10 bg-white/80"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addSelectedProduct}
                  disabled={
                    !selectedProduct ||
                    (!isQuote && selectedProduct.current_stock <= 0)
                  }
                  className="h-10 w-full md:w-auto"
                >
                  <Plus data-icon="inline-start" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/75">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Unitario</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Sem itens.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cartRows.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell className="font-medium">
                          {item.product.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => decreaseProduct(item.product.id)}
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
                              onClick={() => increaseProduct(item.product.id)}
                              disabled={
                                !isQuote &&
                                item.quantity >= item.product.current_stock
                              }
                            >
                              <Plus />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeProduct(item.product.id)}
                            aria-label="Remover item"
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit border-white/70 bg-white/80 lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isQuote ? (
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const active = paymentType === option.value;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={active ? "default" : "outline"}
                      onClick={() => {
                        setPaymentType(option.value);

                        if (option.value !== "credit") {
                          setCustomerId("");
                        }
                      }}
                      className={cn("justify-start", active && "shadow-sm")}
                    >
                      <Icon data-icon="inline-start" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {(isQuote || paymentType === "credit") ? (
            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente</Label>
              <select
                id="customer_id"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                required={paymentType === "credit" && !isQuote}
                className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Sem cliente</option>
                {customerOptions}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="discount">Desconto</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              className="h-10 bg-white/80"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="bg-white/80"
            />
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex justify-between text-sm text-white/70">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-white/70">
              <span>Desconto</span>
              <span>{formatCurrency(discountNumber)}</span>
            </div>
            <div className="mt-3 flex items-end justify-between border-t border-white/15 pt-3">
              <span className="text-sm uppercase">Total</span>
              <span className="text-2xl font-semibold">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="h-11 w-full"
          >
            {isQuote ? (
              <>
                <Printer data-icon="inline-start" />
                Imprimir orcamento
              </>
            ) : (
              <>
                <ReceiptText data-icon="inline-start" />
                {isSubmitting ? "Finalizando..." : "Finalizar venda"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
