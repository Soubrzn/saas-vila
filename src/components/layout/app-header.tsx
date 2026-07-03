import { LogOut } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  shopName: string;
  userEmail?: string | null;
};

export function AppHeader({ shopName, userEmail }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium md:hidden">{shopName}</p>
          <p className="hidden truncate text-sm text-muted-foreground md:block">
            Operacao da loja
          </p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden max-w-56 truncate text-sm text-muted-foreground sm:block">
          {userEmail}
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut data-icon="inline-start" />
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
