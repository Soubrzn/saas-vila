import { cn } from "@/lib/utils";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-muted/80", className)}
    />
  );
}

function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <SkeletonBlock className="h-9 w-48" />
      {action ? <SkeletonBlock className="h-8 w-32" /> : null}
    </div>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white/75 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <SkeletonBlock className="mb-4 h-7 w-full" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonBlock key={index} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SkeletonBlock className="h-32" />
      <SkeletonBlock className="h-32" />
      <SkeletonBlock className="h-32" />
      <SkeletonBlock className="h-32" />
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="space-y-6 p-4 sm:p-6">
        <SkeletonBlock className="h-40 w-full rounded-[2rem]" />
        <MetricsSkeleton />
        <div className="grid gap-4 xl:grid-cols-2">
          <SkeletonBlock className="h-72 rounded-3xl" />
          <SkeletonBlock className="h-72 rounded-3xl" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <SkeletonBlock className="h-64 rounded-3xl" />
          <SkeletonBlock className="h-64 rounded-3xl" />
        </div>
      </div>
    </>
  );
}

export function ListPageSkeleton({
  action = false,
  search = false,
}: {
  action?: boolean;
  search?: boolean;
}) {
  return (
    <>
      <PageHeaderSkeleton action={action} />
      <div className="space-y-4 p-4 sm:p-6">
        {search ? <SkeletonBlock className="h-12 max-w-xl rounded-3xl" /> : null}
        <TableSkeleton />
        <SkeletonBlock className="h-8 w-64" />
      </div>
    </>
  );
}

export function StockPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <TableSkeleton />
          <SkeletonBlock className="h-8 w-64" />
          <TableSkeleton rows={5} />
        </div>
        <SkeletonBlock className="h-[28rem] rounded-3xl" />
      </div>
    </>
  );
}

export function ReportsPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton action />
      <div className="space-y-6 p-4 sm:p-6">
        <MetricsSkeleton />
        <SkeletonBlock className="h-72 rounded-3xl" />
      </div>
    </>
  );
}

export function PdvPageSkeleton() {
  return (
    <main className="h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_30%),linear-gradient(135deg,#f8fafc,#eefdf7_44%,#eef6ff)] p-4">
      <div className="h-full overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.95)] backdrop-blur-xl">
        <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_430px]">
          <section className="flex min-h-0 flex-col border-r border-slate-200/70 bg-white/45">
            <SkeletonBlock className="h-12 rounded-none bg-slate-900/80" />
            <SkeletonBlock className="h-24 rounded-none bg-emerald-700/35" />
            <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <SkeletonBlock className="h-48 rounded-2xl" />
                <SkeletonBlock className="h-40 rounded-2xl" />
              </div>
              <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }, (_, index) => (
                  <SkeletonBlock key={index} className="h-28 rounded-2xl" />
                ))}
              </div>
            </div>
          </section>
          <aside className="hidden min-h-0 flex-col bg-slate-950 p-4 lg:flex">
            <SkeletonBlock className="h-20 rounded-2xl bg-white/10" />
            <div className="mt-4 flex-1 space-y-3">
              <SkeletonBlock className="h-20 rounded-xl bg-white/10" />
              <SkeletonBlock className="h-20 rounded-xl bg-white/10" />
              <SkeletonBlock className="h-20 rounded-xl bg-white/10" />
            </div>
            <SkeletonBlock className="h-14 rounded-2xl bg-emerald-400/30" />
          </aside>
        </div>
      </div>
    </main>
  );
}
