import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useB2BRevenue } from '@/hooks/useB2BRevenue';

const b2bRevenueSchema = z.object({
  isMonthly: z.boolean(),
  invoiceDate: z.string().min(10, 'Date de facturation requise'),
  serviceDate: z.string().optional(),
  monthYear: z.string().optional(),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2020).max(2100).optional(),
  client: z.string().min(2, 'Nom du client requis (min. 2 caractères)'),
  revenueHT_5_5: z.number().min(0).optional(),
  revenueHT_10: z.number().min(0).optional(),
  revenueHT_20: z.number().min(0).optional(),
});

type B2BRevenueFormData = z.infer<typeof b2bRevenueSchema>;

interface B2BRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
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
  } | null;
}

export function B2BRevenueDialog({ open, onOpenChange, editData }: B2BRevenueDialogProps) {
  const { createRevenue, updateRevenue, isCreating, isUpdating } = useB2BRevenue();
  const [totalHT, setTotalHT] = useState(0);
  const isEditMode = !!editData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<B2BRevenueFormData>({
    resolver: zodResolver(b2bRevenueSchema),
    defaultValues: {
      isMonthly: false,
      invoiceDate: '',
      serviceDate: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      client: '',
      revenueHT_5_5: 0,
      revenueHT_10: 0,
      revenueHT_20: 0,
    },
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (editData && open) {
      setValue('invoiceDate', editData.invoiceDate);
      setValue('serviceDate', editData.serviceDate || '');
      setValue('client', editData.client);
      setValue('revenueHT_5_5', editData.revenueHT_5_5 || 0);
      setValue('revenueHT_10', editData.revenueHT_10 || 0);
      setValue('revenueHT_20', editData.revenueHT_20 || 0);
      setValue('isMonthly', editData.isMonthlyDistribution || false);
      if (editData.year) setValue('year', editData.year);
      if (editData.month) setValue('month', editData.month);
    } else if (!editData && !open) {
      reset();
    }
  }, [editData, open, setValue, reset]);

  // Watch les champs
  const isMonthly = watch('isMonthly');
  const revenueHT_5_5 = watch('revenueHT_5_5');
  const revenueHT_10 = watch('revenueHT_10');
  const revenueHT_20 = watch('revenueHT_20');

  useEffect(() => {
    const total =
      (revenueHT_5_5 || 0) +
      (revenueHT_10 || 0) +
      (revenueHT_20 || 0);
    setTotalHT(total);
  }, [revenueHT_5_5, revenueHT_10, revenueHT_20]);

  const onSubmit = async (data: B2BRevenueFormData) => {
    // Calculer le total HT
    const total =
      (data.revenueHT_5_5 || 0) +
      (data.revenueHT_10 || 0) +
      (data.revenueHT_20 || 0);

    // Mode édition : mise à jour
    if (isEditMode && editData) {
      // Si facture mensuelle, recalculer distributionMonth
      let distributionMonth;
      if (data.isMonthly && data.year && data.month) {
        const monthPadded = String(data.month).padStart(2, '0');
        distributionMonth = `${data.year}-${monthPadded}`;
      }

      const payload = {
        serviceDate: data.isMonthly ? '' : (data.serviceDate || ''),
        invoiceDate: data.invoiceDate,
        client: data.client,
        revenueHT_5_5: data.revenueHT_5_5 || 0,
        revenueHT_10: data.revenueHT_10 || 0,
        revenueHT_20: data.revenueHT_20 || 0,
        revenueHT: total,
        isMonthlyDistribution: data.isMonthly || false,
        distributionMonth: distributionMonth || undefined,
      };

      updateRevenue(
        { id: editData.id, data: payload },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        }
      );
      return;
    }

    // Mode création
    if (data.isMonthly) {
      // Mode mensuel : créer UNE SEULE entrée avec répartition mensuelle
      const year = data.year || new Date().getFullYear();
      const month = data.month || new Date().getMonth() + 1;
      const monthPadded = String(month).padStart(2, '0');
      const distributionMonth = `${year}-${monthPadded}`;

      const payload = {
        serviceDate: '', // Vide pour répartition mensuelle
        invoiceDate: data.invoiceDate,
        client: data.client,
        revenueHT_5_5: data.revenueHT_5_5 || 0,
        revenueHT_10: data.revenueHT_10 || 0,
        revenueHT_20: data.revenueHT_20 || 0,
        revenueHT: total,
        isMonthlyDistribution: true,
        distributionMonth,
      };

      createRevenue(payload, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    } else {
      // Mode simple : une seule entrée
      const payload = {
        serviceDate: data.serviceDate || '',
        invoiceDate: data.invoiceDate,
        client: data.client,
        revenueHT_5_5: data.revenueHT_5_5 || 0,
        revenueHT_10: data.revenueHT_10 || 0,
        revenueHT_20: data.revenueHT_20 || 0,
        revenueHT: total,
      };

      createRevenue(payload, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier CA B2B' : 'Ajouter CA B2B'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifiez les informations de cette facture B2B'
              : 'Enregistrez un chiffre d\'affaires B2B manuel'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoiceDate">Date de facturation</Label>
              <DatePicker
                date={watch('invoiceDate')}
                onDateChange={(date) => setValue('invoiceDate', date)}
                placeholder="JJ/MM/AAAA"
              />
              {errors.invoiceDate && (
                <p className="text-sm text-red-600 mt-1">{errors.invoiceDate.message}</p>
              )}
            </div>

            {!isEditMode && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMonthly"
                  checked={isMonthly}
                  onCheckedChange={(checked) => setValue('isMonthly', checked as boolean)}
                />
                <Label htmlFor="isMonthly" className="cursor-pointer font-normal">
                  Répartition mensuelle (diviser par jour)
                </Label>
              </div>
            )}

            {isMonthly ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Année</Label>
                  <Select
                    defaultValue={new Date().getFullYear().toString()}
                    onValueChange={(value) => setValue('year', parseInt(value))}
                  >
                    <SelectTrigger id="year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="month">Mois</Label>
                  <Select
                    defaultValue={(new Date().getMonth() + 1).toString()}
                    onValueChange={(value) => setValue('month', parseInt(value))}
                  >
                    <SelectTrigger id="month">
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
            ) : (
              <div>
                <Label htmlFor="serviceDate">Date de prestation</Label>
                <DatePicker
                  date={watch('serviceDate') || ''}
                  onDateChange={(date) => setValue('serviceDate', date)}
                  placeholder="JJ/MM/AAAA"
                />
                {errors.serviceDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.serviceDate.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                placeholder="Nom du client"
                {...register('client')}
              />
              {errors.client && (
                <p className="text-sm text-red-600 mt-1">{errors.client.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>CA HT par taux de TVA</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="revenueHT_5_5" className="text-sm text-muted-foreground">
                    TVA 5.5%
                  </Label>
                  <Input
                    id="revenueHT_5_5"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                    {...register('revenueHT_5_5', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="revenueHT_10" className="text-sm text-muted-foreground">
                    TVA 10%
                  </Label>
                  <Input
                    id="revenueHT_10"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                    {...register('revenueHT_10', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="revenueHT_20" className="text-sm text-muted-foreground">
                    TVA 20%
                  </Label>
                  <Input
                    id="revenueHT_20"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                    {...register('revenueHT_20', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Total HT</Label>
                <div className="text-2xl font-bold text-green-600">
                  {totalHT.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating || isUpdating}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isEditMode
                ? isUpdating ? 'Modification...' : 'Modifier'
                : isCreating ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
