import { Store } from "lucide-react";
import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/actions/auth";
import { StatusMessage } from "@/components/common/status-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
    <main className="grid min-h-dvh bg-muted/35 lg:grid-cols-[1fr_440px]">
      <section className="hidden border-r bg-[linear-gradient(135deg,oklch(0.43_0.12_154),oklch(0.58_0.13_230))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
            <Store className="size-5" />
          </div>
          <span className="text-lg font-semibold">SaaS Vila</span>
        </div>
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-normal">
            Caixa, estoque e fiado no mesmo lugar.
          </h1>
          <p className="mt-4 text-base leading-7 text-white/80">
            Uma base enxuta para pequenos comercios registrarem vendas,
            acompanharem produtos baixos e controlarem clientes que compram fiado.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-lg">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white lg:hidden">
              <Store className="size-5" />
            </div>
            <CardTitle>Entrar no SaaS Vila</CardTitle>
            <CardDescription>
              Use email e senha para acessar ou criar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusMessage error={params.error} message={params.message} />
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="submit" formAction={signInAction}>
                  Entrar
                </Button>
                <Button type="submit" variant="outline" formAction={signUpAction}>
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
