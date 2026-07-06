function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function AppLoading() {
  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <SkeletonBlock className="h-9 w-48" />
        <SkeletonBlock className="h-8 w-28" />
      </div>
      <div className="space-y-6 p-4 sm:p-6">
        <SkeletonBlock className="h-40 w-full rounded-[2rem]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      </div>
    </>
  );
}
