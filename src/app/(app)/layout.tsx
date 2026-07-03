import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DbSetupRequired } from "@/components/layout/db-setup-required";
import { getCurrentContext } from "@/lib/auth";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const context = await getCurrentContext();

  if (!context.user) {
    redirect("/login");
  }

  if (context.dbError) {
    return <DbSetupRequired error={context.dbError} />;
  }

  if (!context.shop) {
    redirect("/cadastro-loja");
  }

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <AppSidebar shopName={context.shop.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          shopName={context.shop.name}
          userEmail={context.user.email}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
