import { LogOut, Sparkles } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  shopName: string;
  userEmail?: string | null;
};

export function AppHeader({ shopName, userEmail }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/60 bg-background/78 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold md:hidden">{shopName}</p>
          <p className="hidden items-center gap-2 truncate text-sm font-medium text-muted-foreground md:flex">
            <Sparkles className="size-4 text-emerald-600" />
            Painel operacional da loja
          </p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden max-w-56 truncate rounded-full border bg-white/70 px-3 py-1 text-sm text-muted-foreground shadow-sm sm:block">
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
