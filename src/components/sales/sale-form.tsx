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
  fullscreen?: boolean;
  returnTo?: string;
};

const paymentOptions = [
  { value: "cash", label: "Dinheiro", shortcut: "F7", icon: Banknote },
  { value: "pix", label: "Pix", shortcut: "F8", icon: QrCode },
  { value: "card", label: "Cartao", shortcut: "F10", icon: CreditCard },
  { value: "credit", label: "Fiado", shortcut: "F11", icon: UserRound },
];

const shortcuts = [
  { key: "F2", label: "Produto" },
  { key: "Enter", label: "Item" },
  { key: "F3", label: "Preco" },
  { key: "F4", label: "Remover" },
  { key: "F6", label: "Limpar" },
  { key: "F9", label: "Finalizar" },
  { key: "Esc", label: "Sair" },
];

const PRODUCT_RESULT_LIMIT = 36;

function numberValue(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function SaleForm({
  products,
  customers,
  error,
  fullscreen = false,
  returnTo = "/vendas/nova",
}: SaleFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartLengthRef = useRef(0);
  const submittingRef = useRef(false);
  const [saleRequestId] = useState(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  });
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [quantityToAdd, setQuantityToAdd] = useState("1");
  const [priceMode, setPriceMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const searchableProducts = useMemo(() => {
    return products.map((product) => ({
      product,
      normalizedName: normalizeText(product.name),
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return products;
    }

    return searchableProducts
      .filter(({ normalizedName }) => normalizedName.includes(normalizedQuery))
      .map(({ product }) => product);
  }, [products, query, searchableProducts]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, PRODUCT_RESULT_LIMIT);
  }, [filteredProducts]);

  const hiddenProductCount = Math.max(
    filteredProducts.length - visibleProducts.length,
    0,
  );

  const selectedProduct =
    (selectedProductId ? productsById.get(selectedProductId) : null) ??
    filteredProducts[0] ??
    null;

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

  const cartQuantityByProductId = useMemo(() => {
    return new Map(cart.map((item) => [item.productId, item.quantity]));
  }, [cart]);

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
      })),
    );
  }, [cartRows]);

  const currentPayment = paymentOptions.find(
    (option) => option.value === paymentType,
  );

  function addProduct(productId: string, requestedQuantity = quantityToAdd) {
    const product = productsById.get(productId);
    const parsedQuantity = Math.max(1, Number(requestedQuantity) || 1);

    if (submittingRef.current || !product || product.current_stock <= 0) {
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
    setQuantityToAdd("1");
  }

  function decreaseProduct(productId: string) {
    if (submittingRef.current) {
      return;
    }

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
    if (submittingRef.current) {
      return;
    }

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
    if (submittingRef.current) {
      return;
    }

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
      if (event.key === "F5") {
        event.preventDefault();
        searchRef.current?.focus();
      }

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
        if (!submittingRef.current) {
          setCart((current) => current.slice(0, -1));
        }
      }

      if (event.key === "F6") {
        event.preventDefault();
        if (submittingRef.current) {
          return;
        }
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
        if (cartLengthRef.current > 0 && !submittingRef.current) {
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
      onSubmit={(event) => {
        if (submittingRef.current) {
          event.preventDefault();
          return;
        }

        if (cartRows.length === 0) {
          event.preventDefault();
          return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
      }}
      className={cn(
        "overflow-hidden border border-white/70 bg-white/80 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.95)] backdrop-blur-xl",
        fullscreen ? "h-dvh rounded-none border-0 shadow-none" : "rounded-3xl",
      )}
    >
      <input type="hidden" name="sale_request_id" value={saleRequestId} />
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="payment_type" value={paymentType} />
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="return_to" value={returnTo} />

      <div
        className={cn(
          "grid lg:grid-cols-[minmax(0,1fr)_430px]",
          fullscreen ? "h-full min-h-0" : "min-h-[calc(100dvh-9rem)]",
        )}
      >
        <section className="flex min-h-0 min-w-0 flex-col border-r border-slate-200/70 bg-white/45">
          <div className="bg-slate-950 px-4 py-3 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="inline-flex items-center gap-2 font-semibold">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
                PDV
              </div>
              <div className="flex flex-wrap gap-2 text-white/85">
                {shortcuts.map((shortcut) => (
                  <span
                    key={shortcut.key}
                    className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1"
                  >
                    <strong className="text-emerald-200">{shortcut.key}</strong>{" "}
                    {shortcut.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(135deg,#0f766e,#0891b2_55%,#7c3aed)] px-4 py-5 text-white">
            <div className="truncate text-3xl font-semibold tracking-normal sm:text-4xl">
              {selectedProduct ? selectedProduct.name : "CAIXA LIVRE"}
            </div>
            <div className="mt-1 text-sm text-white/75">
              {priceMode ? "Consulta de preco" : "Venda"}
            </div>
          </div>

          <div
            className={cn(
              "grid gap-4 p-4 xl:grid-cols-[320px_1fr]",
              fullscreen && "min-h-0 flex-1 overflow-hidden",
            )}
          >
            <div className={cn("space-y-4", fullscreen && "min-h-0 overflow-y-auto pr-1")}>
              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.8)] backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <PackageSearch className="size-4" />
                  Produto
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-search">Busca</Label>
                    <div className="flex items-center gap-2 rounded-xl border bg-white/80 px-3">
                      <Search className="size-4 text-muted-foreground" />
                      <input
                        id="product-search"
                        ref={searchRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            if (selectedProduct && !priceMode && !isSubmitting) {
                              addProduct(selectedProduct.id);
                            }
                          }
                        }}
                        placeholder="Buscar produto"
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
                      className="h-10 bg-white/80"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.8)] backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="size-4" />
                  Preco
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
                      <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                        <p className="text-xs text-muted-foreground">Preco</p>
                        <p className="text-xl font-semibold text-emerald-800">
                          {formatCurrency(selectedProduct.sale_price)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-100 p-3 ring-1 ring-slate-200">
                        <p className="text-xs text-muted-foreground">Estoque</p>
                        <p className="text-xl font-semibold">
                          {selectedProduct.current_stock}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={
                        isSubmitting ||
                        selectedProduct.current_stock <= 0 ||
                        priceMode
                      }
                      onClick={() => addProduct(selectedProduct.id)}
                    >
                      <Plus data-icon="inline-start" />
                      Adicionar
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
                    Busque um produto.
                  </p>
                )}
              </div>
            </div>

            <div
              className={cn(
                "min-w-0 space-y-4",
                fullscreen && "min-h-0 overflow-y-auto pr-1",
              )}
            >
              <StatusMessage error={error} />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => {
                  const available =
                    product.current_stock -
                    (cartQuantityByProductId.get(product.id) ?? 0);
                  const isSelected = selectedProductId === product.id;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(product.id);
                      }}
                      className={cn(
                        "min-h-28 rounded-2xl border border-white/70 bg-white/85 p-3 text-left shadow-[0_14px_36px_-34px_rgba(15,23,42,0.8)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white",
                        isSelected && "border-emerald-500 ring-2 ring-emerald-500/20",
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
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {available <= 0 ? "sem saldo" : available}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {hiddenProductCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Mostrando {visibleProducts.length} de{" "}
                  {filteredProducts.length}. Use a busca para encontrar mais
                  rapido.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col bg-white/90 backdrop-blur-xl">
          <div className="border-b border-white/10 bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <ReceiptText className="size-5" />
              <h2 className="text-xl font-semibold">Cupom</h2>
            </div>
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col p-4",
              fullscreen && "overflow-y-auto p-3",
            )}
          >
            <div
              className={cn(
                "min-h-64 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-2",
                fullscreen && "h-[clamp(7rem,17dvh,9rem)] min-h-0 flex-none",
              )}
            >
              {cartRows.length === 0 ? (
                <div
                  className={cn(
                    "flex h-full min-h-56 flex-col items-center justify-center text-center text-sm text-muted-foreground",
                    fullscreen && "min-h-0",
                  )}
                >
                  <ShoppingCart
                    className={cn("mb-2 size-8", fullscreen && "size-7")}
                  />
                  Caixa livre
                </div>
              ) : (
                cartRows.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="rounded-xl border border-white/80 bg-white p-3 shadow-sm"
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
                        disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
                          disabled={
                            isSubmitting ||
                            item.quantity >= item.product.current_stock
                          }
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

            <div className={cn("mt-4 space-y-4", fullscreen && "mt-3 space-y-3")}>
              <div
                className={cn(
                  "rounded-2xl border border-slate-200 bg-white/75 p-3 shadow-sm",
                  fullscreen && "p-2.5",
                )}
              >
                <div className={cn("mb-2 flex items-center justify-between", fullscreen && "mb-1")}>
                  <Label>Forma de pagamento</Label>
                  <span className="text-xs text-muted-foreground">
                    {currentPayment?.shortcut}
                  </span>
                </div>
                <div className={cn("grid grid-cols-2 gap-2", fullscreen && "gap-1.5")}>
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const active = paymentType === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={active ? "default" : "outline"}
                        onClick={() => setPaymentType(option.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "justify-start",
                          active && "shadow-sm",
                        )}
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
                      disabled={isSubmitting}
                      required
                      className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

              <div
                className={cn(
                  "grid gap-3 sm:grid-cols-2 lg:grid-cols-1",
                  fullscreen && "grid-cols-2 gap-2",
                )}
              >
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
                    disabled={isSubmitting}
                    className="h-10 bg-white/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observacoes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    className="min-h-10 bg-white/80"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "rounded-2xl bg-[linear-gradient(135deg,#064e3b,#059669_58%,#22c55e)] p-4 text-white shadow-[0_20px_45px_-28px_rgba(5,150,105,0.95)]",
                  fullscreen && "p-3",
                )}
              >
                <div className="flex justify-between text-sm text-white/80">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-white/80">
                  <span>Desconto</span>
                  <span>{formatCurrency(discountNumber)}</span>
                </div>
                <div
                  className={cn(
                    "mt-3 flex items-end justify-between border-t border-white/20 pt-3",
                    fullscreen && "mt-2 pt-2",
                  )}
                >
                  <span className="text-sm uppercase tracking-wide">Total</span>
                  <span className={cn("text-3xl font-semibold", fullscreen && "text-2xl")}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelLastItem}
                  disabled={isSubmitting || cartRows.length === 0}
                >
                  <XCircle data-icon="inline-start" />
                  Remover
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSale}
                  disabled={isSubmitting || cartRows.length === 0}
                >
                  <Trash2 data-icon="inline-start" />
                  Limpar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  disabled={isSubmitting}
                >
                  <LogOut data-icon="inline-start" />
                  Sair
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || cartRows.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Finalizando..." : "Finalizar venda"}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
