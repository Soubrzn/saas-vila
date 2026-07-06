import { ChartNoAxesCombined } from "lucide-react";
import Link from "next/link";

import { SidebarNav } from "@/components/layout/sidebar-nav";

type AppSidebarProps = {
  shopName: string;
};

export function AppSidebar({ shopName }: AppSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.2),transparent_12rem)]" />
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-[0_0_35px_rgba(52,211,153,0.38)]">
            <ChartNoAxesCombined className="size-5" />
          </div>
          <div className="relative min-w-0">
            <p className="truncate text-base font-semibold text-white">SaaS Vila</p>
            <p className="truncate text-xs text-white/55">{shopName}</p>
          </div>
        </Link>
      </div>
      <SidebarNav />
    </aside>
  );
}
