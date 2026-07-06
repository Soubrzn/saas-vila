"use client";

import {
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>SaaS Vila</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted",
                  active && "bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
