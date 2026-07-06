import {
  Boxes,
  ClipboardList,
  Home,
  LineChart,
  Package,
  ReceiptText,
  Users,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/vendas", label: "Vendas", icon: ReceiptText },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/fiados", label: "Fiados", icon: ClipboardList },
  { href: "/relatorios", label: "Relatorios", icon: LineChart },
];
