import { FileText, ReceiptText } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const options = [
  {
    href: "/vendas/nova/orcamento",
    title: "Orcamento",
    description: "Monte uma proposta para o cliente sem baixar estoque.",
    icon: FileText,
  },
  {
    href: "/vendas/nova/venda",
    title: "Venda",
    description: "Registre uma venda normal, com cliente, pagamento e itens.",
    icon: ReceiptText,
  },
];

export default function NewSaleChoicePage() {
  return (
    <>
      <PageHeader
        title="Nova venda"
        description="Escolha se deseja fazer um orcamento ou registrar uma venda comum."
      />
      <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <Link key={option.href} href={option.href} className="block">
              <Card className="h-full border-white/70 bg-white/80 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_28px_70px_-45px_rgba(15,23,42,0.95)]">
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-emerald-700">
                    Abrir {option.title.toLowerCase()}
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
