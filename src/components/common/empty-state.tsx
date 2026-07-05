import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed bg-white/55 px-6 py-10 text-center backdrop-blur">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15">
        <Icon className="size-6 text-emerald-700" />
      </div>
      <h2 className="mt-4 text-base font-medium">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
