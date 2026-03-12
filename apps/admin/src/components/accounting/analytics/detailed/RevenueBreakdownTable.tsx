'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RevenueBreakdownRow {
  period: string;
  label?: string;
  b2c: number;
  b2b: number;
  total: number;
}

interface RevenueBreakdownTableProps {
  data: RevenueBreakdownRow[];
  periodLabel: string; // "Mois", "Jour", "Semaine"
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function RevenueBreakdownTable({ data, periodLabel }: RevenueBreakdownTableProps) {
  const totalB2C = data.reduce((sum, row) => sum + row.b2c, 0);
  const totalB2B = data.reduce((sum, row) => sum + row.b2b, 0);
  const grandTotal = totalB2C + totalB2B;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{periodLabel}</TableHead>
            <TableHead className="text-right">B2C</TableHead>
            <TableHead className="text-right">B2B</TableHead>
            <TableHead className="text-right font-semibold">TOTAL</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {row.label || row.period}
              </TableCell>
              <TableCell className="text-right text-blue-700">
                {formatCurrency(row.b2c)}
              </TableCell>
              <TableCell className="text-right text-green-700">
                {formatCurrency(row.b2b)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(row.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold text-blue-700">
              {formatCurrency(totalB2C)}
            </TableCell>
            <TableCell className="text-right font-bold text-green-700">
              {formatCurrency(totalB2B)}
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatCurrency(grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
