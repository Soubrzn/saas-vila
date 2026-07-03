import { Badge } from "@/components/ui/badge";

type StockBadgeProps = {
  current: number;
  minimum: number;
};

export function StockBadge({ current, minimum }: StockBadgeProps) {
  if (current <= minimum) {
    return <Badge variant="destructive">Baixo</Badge>;
  }

  return <Badge variant="secondary">Ok</Badge>;
}
