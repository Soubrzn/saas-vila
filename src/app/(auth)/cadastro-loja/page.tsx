import { Store } from "lucide-react";
import { redirect } from "next/navigation";

import { createShopAction } from "@/actions/shops";
import { StatusMessage } from "@/components/common/status-message";
import { SubmitButton } from "@/components/common/submit-button";
import { DbSetupRequired } from "@/components/layout/db-setup-required";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentContext } from "@/lib/auth";

type ShopOnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ShopOnboardingPage({
  searchParams,
}: ShopOnboardingPageProps) {
  const context = await getCurrentContext();
  const params = await searchParams;

  if (!context.user) {
    redirect("/login");
  }

  if (context.dbError) {
    return <DbSetupRequired error={context.dbError} />;
  }

  if (context.shop) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/35 p-4">
      <Card className="w-full max-w-lg rounded-lg">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Store className="size-5" />
          </div>
          <CardTitle>Nova loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusMessage error={params.error} message={params.message} />
          <form action={createShopAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da loja</Label>
              <Input
                id="name"
                name="name"
                placeholder="Mercadinho Vila Nova"
                required
              />
            </div>
            <SubmitButton
              type="submit"
              pendingLabel="Criando..."
              className="w-full"
            >
              Criar loja
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
