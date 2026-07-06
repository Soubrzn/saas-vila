"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();

  return (
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
  );
}
