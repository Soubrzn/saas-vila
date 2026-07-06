import { registerStockMovementAction } from "@/actions/stock";
import { StatusMessage } from "@/components/common/status-message";
import { SubmitButton } from "@/components/common/submit-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type StockProductOption = {
  id: string;
  name: string;
  current_stock: number;
};

type StockMovementFormProps = {
  products: StockProductOption[];
  error?: string;
  message?: string;
};

export function StockMovementForm({
  products,
  error,
  message,
}: StockMovementFormProps) {
  return (
    <Card className="border-white/70 bg-white/80 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.9)] xl:sticky xl:top-24">
      <CardHeader>
        <CardTitle>Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={registerStockMovementAction} className="space-y-4">
          <StatusMessage error={error} message={message} />
          <div className="space-y-2">
            <Label htmlFor="product_id">Produto</Label>
            <select
              id="product_id"
              name="product_id"
              required
              className="h-10 w-full rounded-lg border border-input bg-white/70 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Selecione</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - saldo {product.current_stock}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="movement_kind">Tipo</Label>
            <select
              id="movement_kind"
              name="movement_kind"
              defaultValue="purchase"
              className="h-10 w-full rounded-lg border border-input bg-white/70 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="purchase">Compra</option>
              <option value="adjustment_in">Ajuste entrada</option>
              <option value="adjustment_out">Ajuste saida</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              required
              className="h-10 bg-white/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea id="notes" name="notes" className="bg-white/70" />
          </div>
          <SubmitButton
            type="submit"
            disabled={products.length === 0}
            pendingLabel="Registrando..."
            className="h-10 w-full"
          >
            Registrar
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
