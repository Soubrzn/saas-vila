import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { SalesTable } from "@/components/sales/sales-table";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SalesPage() {
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const { data: sales } = await supabase
    .from("sales")
    .select("id, payment_type, total, sold_at, customers(name)")
    .eq("shop_id", shop.id)
    .order("sold_at", { ascending: false })
    .limit(50);

  const rows = (sales ?? []).map((sale) => ({
    ...sale,
    customers: Array.isArray(sale.customers)
      ? sale.customers[0] ?? null
      : sale.customers,
  }));

  return (
    <>
      <PageHeader
        title="Vendas"
        description="Historico recente das vendas registradas."
        action={
          <>
            <Link
              href="/pdv"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink data-icon="inline-start" />
              PDV externo
            </Link>
            <Link
              href="/vendas/nova"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus data-icon="inline-start" />
              Nova
            </Link>
          </>
        }
      />
      <div className="p-4 sm:p-6">
        <SalesTable sales={rows} />
      </div>
    </>
  );
}
