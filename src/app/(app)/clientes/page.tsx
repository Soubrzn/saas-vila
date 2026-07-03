import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { StatusMessage } from "@/components/common/status-message";
import { CustomersTable } from "@/components/customers/customers-table";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type CustomersPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .eq("shop_id", shop.id)
    .order("name");

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Clientes usados em vendas fiado."
        action={
          <Link
            href="/clientes/novo"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus data-icon="inline-start" />
            Novo
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <StatusMessage error={params.error} message={params.message} />
        <CustomersTable customers={customers ?? []} />
      </div>
    </>
  );
}
