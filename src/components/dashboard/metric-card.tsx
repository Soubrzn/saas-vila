import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "emerald" | "cyan" | "amber" | "violet";
};

const tones = {
  emerald: "from-emerald-500/18 to-emerald-500/4 text-emerald-700",
  cyan: "from-cyan-500/18 to-cyan-500/4 text-cyan-700",
  amber: "from-amber-500/22 to-amber-500/5 text-amber-700",
  violet: "from-violet-500/18 to-violet-500/4 text-violet-700",
};

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "emerald",
}: MetricCardProps) {
  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <div
          className={`flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]}`}
        >
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-normal">{value}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
