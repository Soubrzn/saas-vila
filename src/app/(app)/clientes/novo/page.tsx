import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/common/page-header";

type NewCustomerPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewCustomerPage({
  searchParams,
}: NewCustomerPageProps) {
  const params = await searchParams;

  return (
    <>
      <PageHeader
        title="Novo cliente"
        description="Cadastre clientes para controlar fiado."
      />
      <div className="max-w-3xl p-4 sm:p-6">
        <CustomerForm error={params.error} />
      </div>
    </>
  );
}
