import { LogOut } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { SubmitButton } from "@/components/common/submit-button";
import { MobileNav } from "@/components/layout/mobile-nav";

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
          <p className="truncate text-sm font-semibold">{shopName}</p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden max-w-56 truncate rounded-full border bg-white/70 px-3 py-1 text-sm text-muted-foreground shadow-sm sm:block">
          {userEmail}
        </span>
        <form action={signOutAction}>
          <SubmitButton
            type="submit"
            variant="outline"
            size="sm"
            pendingLabel="Saindo..."
          >
            <LogOut data-icon="inline-start" />
            Sair
          </SubmitButton>
        </form>
      </div>
    </header>
  );
}
