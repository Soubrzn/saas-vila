import { createCustomerAction } from "@/actions/customers";
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

type CustomerFormProps = {
  error?: string;
};

export function CustomerForm({ error }: CustomerFormProps) {
  return (
    <Card className="border-white/70 bg-white/80 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.9)]">
      <CardHeader>
        <CardTitle>Novo cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createCustomerAction} className="space-y-4">
          <StatusMessage error={error} />
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Maria Silva"
              required
              className="h-10 bg-white/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(65) 99999-9999"
              className="h-10 bg-white/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea id="notes" name="notes" className="bg-white/70" />
          </div>
          <Button type="submit" className="h-10 w-full sm:w-auto">
            Salvar cliente
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
