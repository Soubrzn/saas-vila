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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{shopName}</p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
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
