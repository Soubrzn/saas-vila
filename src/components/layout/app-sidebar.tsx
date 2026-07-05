"use client";

import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  LineChart,
  Home,
  Package,
  ReceiptText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/vendas", label: "Vendas", icon: ReceiptText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/fiados", label: "Fiados", icon: ClipboardList },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/relatorios", label: "Relatorios", icon: LineChart },
];

type AppSidebarProps = {
  shopName: string;
};

export function AppSidebar({ shopName }: AppSidebarProps) {
  const pathname = usePathname();

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
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-white/72 transition-all hover:bg-white/8 hover:text-white",
                active &&
                  "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl bg-white/7 text-white/70 transition-colors group-hover:text-emerald-200",
                  active && "bg-emerald-400 text-slate-950",
                )}
              >
                <Icon className="size-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl border border-white/10 bg-white/7 p-4 text-sm text-white/70">
        <p className="font-medium text-white">Modo Vila</p>
        <p className="mt-1 text-xs leading-5">
          Operacao simples para vender, repor e cobrar sem perder o ritmo do
          balcao.
        </p>
      </div>
    </aside>
  );
}
