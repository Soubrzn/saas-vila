import { FileText, ReceiptText } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const options = [
  {
    href: "/vendas/nova/orcamento",
    title: "Orcamento",
    icon: FileText,
  },
  {
    href: "/vendas/nova/venda",
    title: "Venda",
    icon: ReceiptText,
  },
];

export default function NewSaleChoicePage() {
  return (
    <>
      <PageHeader title="Nova venda" />
      <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <Link key={option.href} href={option.href} className="block">
              <Card className="h-full rounded-lg transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">
                    Abrir
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
