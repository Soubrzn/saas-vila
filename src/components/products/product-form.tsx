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
            <Input id="name" name="name" placeholder="Arroz 5kg" required />
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
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque minimo</Label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                min="0"
                required
              />
            </div>
          </div>
          <Button type="submit">Cadastrar produto</Button>
        </form>
      </CardContent>
    </Card>
  );
}
