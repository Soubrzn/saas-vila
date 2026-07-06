export default function AuthLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="h-12 w-40 animate-pulse rounded-2xl bg-muted" />
        <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      </div>
    </main>
  );
}
