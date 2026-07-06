import { PageHeader } from "@/components/common/page-header";
import { ProductForm } from "@/components/products/product-form";

type NewProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  const params = await searchParams;

  return (
    <>
      <PageHeader title="Novo produto" />
      <div className="max-w-3xl p-4 sm:p-6">
        <ProductForm error={params.error} />
      </div>
    </>
  );
}
