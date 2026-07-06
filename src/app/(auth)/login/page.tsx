import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ReceiptText,
  Store,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/actions/auth";
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
import { getCurrentContext } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const proofItems = [
  { icon: ReceiptText, label: "PDV" },
  { icon: Boxes, label: "Estoque" },
  { icon: BadgeCheck, label: "Fiado" },
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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,19,0.96),rgba(7,16,19,0.72)_48%,rgba(7,16,19,0.35))]" />

      <section className="relative z-10 grid min-h-dvh gap-10 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:px-12">
        <div className="flex min-h-[48dvh] flex-col justify-between gap-10 py-4 lg:min-h-[82dvh]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-[0_0_40px_rgba(52,211,153,0.45)]">
              <Store className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-normal">SaaS Vila</p>
              <p className="text-xs text-emerald-100">Vendas, estoque e fiado</p>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              SaaS Vila
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/74 sm:text-lg">
              Gestao simples para pequenos comercios.
            </p>
            <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-3">
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

          <div />
        </div>

        <Card className="rounded-3xl border-white/15 bg-white/92 text-slate-950 shadow-[0_32px_80px_-38px_rgba(0,0,0,0.75)]">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
              <Store className="size-5" />
            </div>
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
                <SubmitButton
                  type="submit"
                  size="lg"
                  formAction={signInAction}
                  pendingLabel="Entrando..."
                >
                  Entrar
                  <ArrowRight data-icon="inline-end" />
                </SubmitButton>
                <SubmitButton
                  type="submit"
                  size="lg"
                  variant="outline"
                  formAction={signUpAction}
                  pendingLabel="Criando..."
                >
                  Criar conta
                </SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
