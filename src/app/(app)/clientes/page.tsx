import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";
import { StatusMessage } from "@/components/common/status-message";
import { CustomersTable } from "@/components/customers/customers-table";
import { buttonVariants } from "@/components/ui/button";
import { requireCurrentShop } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

type CustomersPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    page?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const { shop } = await requireCurrentShop();
  const supabase = await createClient();
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const { data: customers, count } = await supabase
    .from("customers")
    .select("id, name, phone, created_at", { count: "exact" })
    .eq("shop_id", shop.id)
    .order("name")
    .range(from, to);

  return (
    <>
      <PageHeader
        title="Clientes"
        action={
          <Link
            href="/clientes/novo"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus data-icon="inline-start" />
            Novo cliente
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <StatusMessage error={params.error} message={params.message} />
        <CustomersTable customers={customers ?? []} />
        <PaginationControls
          basePath="/clientes"
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalCount={count ?? 0}
        />
      </div>
    </>
  );
}
