import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

type PaginationControlsProps = {
  basePath: string;
  page: number;
  pageSize: number;
  totalCount: number;
  params?: Record<string, string | undefined>;
};

function pageHref(
  basePath: string,
  targetPage: number,
  params?: Record<string, string | undefined>,
) {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  if (targetPage > 1) {
    query.set("page", String(targetPage));
  }

  const queryString = query.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function PaginationControls({
  basePath,
  page,
  pageSize,
  totalCount,
  params,
}: PaginationControlsProps) {
  if (totalCount <= pageSize) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        {start}-{end} de {totalCount}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={pageHref(basePath, currentPage - 1, params)}
          aria-disabled={currentPage <= 1}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: currentPage <= 1 ? "pointer-events-none opacity-50" : "",
          })}
        >
          Anterior
        </Link>
        <span className="px-2">
          {currentPage}/{totalPages}
        </span>
        <Link
          href={pageHref(basePath, currentPage + 1, params)}
          aria-disabled={currentPage >= totalPages}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className:
              currentPage >= totalPages ? "pointer-events-none opacity-50" : "",
          })}
        >
          Proxima
        </Link>
      </div>
    </div>
  );
}
