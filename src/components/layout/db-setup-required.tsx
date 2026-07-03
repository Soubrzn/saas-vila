import { Database, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type DbSetupRequiredProps = {
  error?: string | null;
};

export function DbSetupRequired({ error }: DbSetupRequiredProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/35 p-4">
      <section className="w-full max-w-xl rounded-lg border bg-background p-6 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Database className="size-5" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Banco ainda nao configurado</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Rode a migration inicial no SQL Editor do Supabase antes de testar o
          login completo, cadastro de loja, produtos e vendas.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Retorno atual do Supabase: {error}
          </p>
        ) : null}
        <Button className="mt-5" variant="outline" render={<Link href="/login" />}>
          <ExternalLink data-icon="inline-start" />
          Voltar ao login
        </Button>
      </section>
    </main>
  );
}
