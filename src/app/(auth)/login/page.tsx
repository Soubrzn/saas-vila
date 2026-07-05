import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ReceiptText,
  ShieldCheck,
  Store,
} from "lucide-react";
import Image from "next/image";
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

const proofItems = [
  { icon: ReceiptText, label: "PDV rapido" },
  { icon: Boxes, label: "Estoque vivo" },
  { icon: BadgeCheck, label: "Fiado sob controle" },
];

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
    <main className="relative min-h-dvh overflow-hidden bg-[#071013] text-white">
      <Image
        src="/brand/saas-vila-hero.png"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-55"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.32),transparent_28rem),linear-gradient(90deg,rgba(7,16,19,0.96),rgba(7,16,19,0.72)_48%,rgba(7,16,19,0.35))]" />

      <section className="relative z-10 grid min-h-dvh gap-10 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:px-12">
        <div className="flex min-h-[48dvh] flex-col justify-between gap-10 py-4 lg:min-h-[82dvh]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.45)]">
              <Store className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-normal">SaaS Vila</p>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">
                comercio local inteligente
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-emerald-100 backdrop-blur-xl">
              <ShieldCheck className="size-4" />
              Feito para lojas pequenas venderem como gente grande
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Seu caixa, estoque e fiado em uma central bonita de usar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
              O SaaS Vila organiza vendas de balcao, produtos, clientes e
              dividas abertas com a simplicidade que o comercio de bairro
              precisa e o visual que uma startup venderia.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {proofItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur-xl"
                  >
                    <Icon className="mb-3 size-5 text-emerald-300" />
                    <p className="text-sm font-medium text-white">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-white/50">
            Mercadinhos, bares, depositos, mercearias e lojas de bairro.
          </p>
        </div>

        <Card className="rounded-3xl border-white/15 bg-white/92 text-slate-950 shadow-[0_32px_80px_-38px_rgba(0,0,0,0.75)]">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
              <Store className="size-5" />
            </div>
            <CardTitle className="text-2xl">Entrar no painel</CardTitle>
            <CardDescription>
              Acesse sua loja ou crie uma conta para comecar agora.
            </CardDescription>
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
                  Entrar no SaaS Vila
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  formAction={signUpAction}
                >
                  Criar minha loja
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
