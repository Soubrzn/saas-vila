import {
  ArrowRight,
  Store,
} from "lucide-react";
import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/actions/auth";
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
import { getCurrentContext } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user, shop } = await getCurrentContext();
  const params = await searchParams;

  if (user && shop) {
    redirect("/dashboard");
  }

  if (user && !shop) {
    redirect("/cadastro-loja");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <section className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">SaaS Vila</h1>
            <p className="text-sm text-muted-foreground">
              Vendas, estoque e fiado.
            </p>
          </div>
        </div>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl">Entrar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusMessage error={params.error} message={params.message} />
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@sualoja.com"
                  required
                  className="h-11 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="h-11 bg-white"
                />
              </div>
              <div className="grid gap-2">
                <Button type="submit" size="lg" formAction={signInAction}>
                  Entrar
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  formAction={signUpAction}
                >
                  Criar conta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
