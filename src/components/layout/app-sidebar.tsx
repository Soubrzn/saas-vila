"use client";

import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
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
];

type AppSidebarProps = {
  shopName: string;
};

export function AppSidebar({ shopName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
      <div className="border-b px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ChartNoAxesCombined className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">SaaS Vila</p>
            <p className="truncate text-xs text-muted-foreground">{shopName}</p>
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
                "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                active &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
