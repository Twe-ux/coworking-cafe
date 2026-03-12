'use client';

import { useState } from 'react';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { B2BRevenueDialog } from './B2BRevenueDialog';
import { useB2BRevenueList, useB2BRevenue } from '@/hooks/useB2BRevenue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface B2BEntry {
  _id: string;
  serviceDate: string;
  invoiceDate: string;
  client: string;
  revenueHT_5_5?: number;
  revenueHT_10?: number;
  revenueHT_20?: number;
  revenueHT: number;
  isMonthlyDistribution?: boolean;
  distributionMonth?: string;
  createdAt: string;
}

interface MonthlyGroup {
  month: string;
  year: number;
  entries: B2BEntry[];
  total: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'long' });
  return `${monthName} ${year}`;
}

export function B2BListView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<{
    id: string;
    invoiceDate: string;
    serviceDate?: string;
    client: string;
    revenueHT_5_5?: number;
    revenueHT_10?: number;
    revenueHT_20?: number;
    isMonthlyDistribution?: boolean;
    year?: number;
    month?: number;
  } | null>(null);

  // Use React Query hook with cache
  const { data = [], isLoading } = useB2BRevenueList(year, month);
  const { deleteRevenue } = useB2BRevenue();

  const handleEdit = (entry: B2BEntry) => {
    // Extract year and month from distributionMonth if monthly distribution
    let year, month;
    if (entry.isMonthlyDistribution && entry.distributionMonth) {
      const [y, m] = entry.distributionMonth.split('-').map(Number);
      year = y;
      month = m;
    }

    setEditingEntry({
      id: entry._id,
      invoiceDate: entry.invoiceDate,
      serviceDate: entry.serviceDate || '',
      client: entry.client,
      revenueHT_5_5: entry.revenueHT_5_5,
      revenueHT_10: entry.revenueHT_10,
      revenueHT_20: entry.revenueHT_20,
      isMonthlyDistribution: entry.isMonthlyDistribution,
      year,
      month,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingEntry(null);
    // React Query invalidation handles refresh automatically
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingId) return;

    deleteRevenue(deletingId, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setDeletingId(null);
      }
    });
  };

  const total = data.reduce((sum, entry) => sum + entry.revenueHT, 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="w-32">
          <Label htmlFor="year-select">Année</Label>
          <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
            <SelectTrigger id="year-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Label htmlFor="month-select">Mois</Label>
          <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
            <SelectTrigger id="month-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border rounded-lg">
          Aucune facture B2B pour cette période
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Prestation</TableHead>
                <TableHead>Date Facturation</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">TVA 5.5%</TableHead>
                <TableHead className="text-right">TVA 10%</TableHead>
                <TableHead className="text-right">TVA 20%</TableHead>
                <TableHead className="text-right font-semibold">Total HT</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {entry.isMonthlyDistribution && entry.distributionMonth
                        ? formatMonth(entry.distributionMonth)
                        : formatDate(entry.serviceDate)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(entry.invoiceDate)}</TableCell>
                  <TableCell className="font-medium">{entry.client}</TableCell>
                  <TableCell className="text-right text-sm">
                    {entry.revenueHT_5_5 ? formatCurrency(entry.revenueHT_5_5) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {entry.revenueHT_10 ? formatCurrency(entry.revenueHT_10) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {entry.revenueHT_20 ? formatCurrency(entry.revenueHT_20) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(entry.revenueHT)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(entry)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(entry._id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableRow className="bg-slate-100 font-bold">
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.reduce((sum, e) => sum + (e.revenueHT_5_5 || 0), 0))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.reduce((sum, e) => sum + (e.revenueHT_10 || 0), 0))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.reduce((sum, e) => sum + (e.revenueHT_20 || 0), 0))}
              </TableCell>
              <TableCell className="text-right text-lg">
                {formatCurrency(total)}
              </TableCell>
              <TableCell />
            </TableRow>
          </Table>
        </div>
      )}

      <B2BRevenueDialog
        open={editDialogOpen}
        onOpenChange={handleCloseEditDialog}
        editData={editingEntry}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture B2B ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
