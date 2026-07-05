"use client";

import {
  Banknote,
  CreditCard,
  DollarSign,
  LogOut,
  Minus,
  PackageSearch,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { registerSaleAction } from "@/actions/sales";
import { StatusMessage } from "@/components/common/status-message";
import { Button } from "@/components/ui/button";
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
  { value: "cash", label: "Dinheiro", shortcut: "F7", icon: Banknote },
  { value: "pix", label: "Pix", shortcut: "F8", icon: QrCode },
  { value: "card", label: "Cartao", shortcut: "F10", icon: CreditCard },
  { value: "credit", label: "Fiado", shortcut: "F11", icon: UserRound },
];

const shortcuts = [
  { key: "F2", label: "Produto" },
  { key: "F3", label: "Preco" },
  { key: "F4", label: "Canc. item" },
  { key: "F6", label: "Canc. tudo" },
  { key: "F9", label: "Finalizar" },
  { key: "Esc", label: "Sair" },
];

function numberValue(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function SaleForm({ products, customers, error }: SaleFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartLengthRef = useRef(0);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [quantityToAdd, setQuantityToAdd] = useState("1");
  const [priceMode, setPriceMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) =>
      normalizeText(product.name).includes(normalizedQuery),
    );
  }, [products, query]);

  const selectedProduct =
    (selectedProductId ? productsById.get(selectedProductId) : null) ??
    filteredProducts[0] ??
    null;

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

  const currentPayment = paymentOptions.find(
    (option) => option.value === paymentType,
  );

  function addProduct(productId: string, requestedQuantity = quantityToAdd) {
    const product = productsById.get(productId);
    const parsedQuantity = Math.max(1, Number(requestedQuantity) || 1);

    if (!product || product.current_stock <= 0) {
      return;
    }

    setSelectedProductId(productId);
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      const existingQuantity = existing?.quantity ?? 0;
      const allowedQuantity = Math.min(
        parsedQuantity,
        product.current_stock - existingQuantity,
      );

      if (allowedQuantity <= 0) {
        return current;
      }

      if (!existing) {
        return [...current, { productId, quantity: allowedQuantity }];
      }

      return current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + allowedQuantity }
          : item,
      );
    });
  }

  function decreaseProduct(productId: string) {
    setSelectedProductId(productId);
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

  function cancelLastItem() {
    const lastItem = cart.at(-1);

    if (lastItem) {
      removeProduct(lastItem.productId);
    }
  }

  function clearSale() {
    setCart([]);
    setCustomerId("");
    setDiscount("0");
    setPaymentType("cash");
    setSelectedProductId(null);
    setQuery("");
    setQuantityToAdd("1");
    searchRef.current?.focus();
  }

  useEffect(() => {
    cartLengthRef.current = cartRows.length;
  }, [cartRows.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "F2") {
        event.preventDefault();
        setPriceMode(false);
        searchRef.current?.focus();
      }

      if (event.key === "F3") {
        event.preventDefault();
        setPriceMode(true);
        searchRef.current?.focus();
      }

      if (event.key === "F4") {
        event.preventDefault();
        setCart((current) => current.slice(0, -1));
      }

      if (event.key === "F6") {
        event.preventDefault();
        setCart([]);
        setCustomerId("");
        setDiscount("0");
        setPaymentType("cash");
        setSelectedProductId(null);
        setQuery("");
        setQuantityToAdd("1");
        searchRef.current?.focus();
      }

      if (event.key === "F7") {
        event.preventDefault();
        setPaymentType("cash");
      }

      if (event.key === "F8") {
        event.preventDefault();
        setPaymentType("pix");
      }

      if (event.key === "F9") {
        event.preventDefault();
        if (cartLengthRef.current > 0) {
          formRef.current?.requestSubmit();
        }
      }

      if (event.key === "F10") {
        event.preventDefault();
        setPaymentType("card");
      }

      if (event.key === "F11") {
        event.preventDefault();
        setPaymentType("credit");
      }

      if (event.key === "Escape") {
        event.preventDefault();
        router.push("/dashboard");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <form
      ref={formRef}
      action={registerSaleAction}
      className="overflow-hidden rounded-lg border bg-background shadow-sm"
    >
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="payment_type" value={paymentType} />
      <input type="hidden" name="customer_id" value={customerId} />

      <div className="grid min-h-[calc(100dvh-9rem)] lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="flex min-w-0 flex-col border-r bg-muted/20">
          <div className="bg-red-700 px-4 py-3 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="font-semibold">SaaS Vila PDV</div>
              <div className="flex flex-wrap gap-3 text-white/85">
                {shortcuts.map((shortcut) => (
                  <span key={shortcut.key}>
                    <strong className="text-white">{shortcut.key}</strong>{" "}
                    {shortcut.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-800 px-4 py-4 text-white">
            <div className="truncate text-3xl font-semibold tracking-normal sm:text-4xl">
              {selectedProduct ? selectedProduct.name : "CAIXA LIVRE"}
            </div>
            <div className="mt-1 text-sm text-white/75">
              {priceMode ? "Consulta de preco ativa" : "Venda em andamento"}
            </div>
          </div>

          <div className="grid gap-4 p-4 xl:grid-cols-[320px_1fr]">
            <div className="space-y-4">
              <div className="rounded-lg border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <PackageSearch className="size-4" />
                  Buscar produto
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-search">Codigo ou descricao</Label>
                    <div className="flex items-center gap-2 rounded-lg border px-2.5">
                      <Search className="size-4 text-muted-foreground" />
                      <input
                        id="product-search"
                        ref={searchRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            if (selectedProduct && !priceMode) {
                              addProduct(selectedProduct.id);
                            }
                          }
                        }}
                        placeholder="F2 buscar produto"
                        className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantityToAdd}
                      onChange={(event) => setQuantityToAdd(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="size-4" />
                  Consulta de preco
                </div>
                {selectedProduct ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Produto</p>
                      <p className="line-clamp-2 font-medium">
                        {selectedProduct.name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-xs text-muted-foreground">Preco</p>
                        <p className="text-xl font-semibold">
                          {formatCurrency(selectedProduct.sale_price)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-xs text-muted-foreground">Estoque</p>
                        <p className="text-xl font-semibold">
                          {selectedProduct.current_stock}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={selectedProduct.current_stock <= 0 || priceMode}
                      onClick={() => addProduct(selectedProduct.id)}
                    >
                      <Plus data-icon="inline-start" />
                      Lancar item
                    </Button>
                    {selectedProduct.current_stock <= 0 ? (
                      <p className="text-xs text-destructive">
                        Produto sem saldo. Lance uma compra ou ajuste de entrada
                        em Estoque.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Digite parte do nome para consultar o preco.
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              <StatusMessage error={error} />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const item = cart.find((row) => row.productId === product.id);
                  const available = product.current_stock - (item?.quantity ?? 0);
                  const isSelected = selectedProductId === product.id;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(product.id);
                        if (!priceMode) {
                          addProduct(product.id);
                        }
                      }}
                      className={cn(
                        "min-h-28 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted/50",
                        isSelected && "border-blue-700 ring-2 ring-blue-700/20",
                        available <= 0 && "opacity-60",
                      )}
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <p className="line-clamp-2 text-sm font-medium">
                            {product.name}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-xs",
                              product.current_stock <= 0
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            Estoque {product.current_stock}
                          </p>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <span className="text-lg font-semibold">
                            {formatCurrency(product.sale_price)}
                          </span>
                          <span className="rounded-md bg-muted px-2 py-1 text-xs">
                            {available <= 0 ? "sem saldo" : "Enter"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <aside className="flex min-h-full flex-col bg-background">
          <div className="border-b bg-blue-800 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5" />
              <h2 className="text-xl font-semibold">Cupom</h2>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4">
            <div className="min-h-64 flex-1 space-y-2 overflow-y-auto rounded-lg border bg-white p-2">
              {cartRows.length === 0 ? (
                <div className="flex h-full min-h-56 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                  <ShoppingCart className="mb-2 size-8" />
                  Caixa livre
                </div>
              ) : (
                cartRows.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="rounded-md border bg-background p-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Item {index + 1}
                        </p>
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeProduct(item.product.id)}
                        aria-label="Cancelar item"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
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
                        <span className="flex h-7 w-12 items-center justify-center rounded-lg border text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => addProduct(item.product.id, "1")}
                          aria-label="Aumentar quantidade"
                          disabled={item.quantity >= item.product.current_stock}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)}
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Label>Forma de pagamento</Label>
                  <span className="text-xs text-muted-foreground">
                    {currentPayment?.shortcut}
                  </span>
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
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="customer-select">Cliente do fiado</Label>
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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

              <div className="rounded-lg bg-red-700 p-4 text-white">
                <div className="flex justify-between text-sm text-white/80">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-white/80">
                  <span>Desconto</span>
                  <span>{formatCurrency(discountNumber)}</span>
                </div>
                <div className="mt-3 flex items-end justify-between border-t border-white/20 pt-3">
                  <span className="text-sm uppercase tracking-wide">Total</span>
                  <span className="text-3xl font-semibold">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelLastItem}
                  disabled={cartRows.length === 0}
                >
                  <XCircle data-icon="inline-start" />
                  Canc. item
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSale}
                  disabled={cartRows.length === 0}
                >
                  <Trash2 data-icon="inline-start" />
                  Canc. tudo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  <LogOut data-icon="inline-start" />
                  Sair
                </Button>
                <Button
                  type="submit"
                  disabled={cartRows.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Finalizar
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
