"use client";

import {
  Boxes,
  ClipboardList,
  Home,
  LineChart,
  Package,
  ReceiptText,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/vendas", label: "Vendas", icon: ReceiptText },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/fiados", label: "Fiados", icon: ClipboardList },
  { href: "/relatorios", label: "Relatorios", icon: LineChart },
];

type AppSidebarProps = {
  shopName: string;
};

export function AppSidebar({ shopName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Store className="size-4" />
          </div>
          <div className="min-w-0">
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
                "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white",
                active &&
                  "bg-white/12 text-white",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-white/70 transition-colors group-hover:text-white",
                  active && "bg-sidebar-primary text-sidebar-primary-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
