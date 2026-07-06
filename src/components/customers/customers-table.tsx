import { UserPlus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
};

type CustomersTableProps = {
  customers: CustomerRow[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={UserPlus}
        title="Nenhum cliente cadastrado"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-white/75 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cadastrado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.phone || "-"}</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("pt-BR").format(
                  new Date(customer.created_at),
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
