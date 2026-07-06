import { createProductAction } from "@/actions/products";
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

type ProductFormProps = {
  error?: string;
};

export function ProductForm({ error }: ProductFormProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Novo produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createProductAction} className="space-y-4">
          <StatusMessage error={error} />
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Arroz 5kg"
              required
              className="h-10 bg-white/70"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Preco de custo</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                required
                className="h-10 bg-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Preco de venda</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="0.01"
                min="0"
                required
                className="h-10 bg-white/70"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Estoque inicial</Label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                min="0"
                defaultValue="0"
                required
                className="h-10 bg-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque minimo</Label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                min="0"
                required
                className="h-10 bg-white/70"
              />
            </div>
          </div>
          <Button type="submit" className="h-10 w-full sm:w-auto">
            Adicionar produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
