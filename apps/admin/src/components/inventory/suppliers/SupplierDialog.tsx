'use client'

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SupplierDLCAlertFields } from './SupplierDLCAlertFields'
import { useSupplierForm } from '@/hooks/inventory/useSupplierForm'
import type { Supplier, SupplierFormData } from '@/types/inventory'

const CATEGORY_OPTIONS = [
  { value: 'food' as const, label: 'Alimentation' },
  { value: 'cleaning' as const, label: 'Entretien' },
  { value: 'emballage' as const, label: 'Emballage' },
  { value: 'papeterie' as const, label: 'Papeterie' },
  { value: 'divers' as const, label: 'Divers' },
]

interface SupplierDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: SupplierFormData) => Promise<boolean>
  supplier?: Supplier | null
  mode?: 'create' | 'edit'
}

export function SupplierDialog({
  open,
  onClose,
  onSubmit,
  supplier,
  mode = 'create',
}: SupplierDialogProps) {
  const { form, loading, checkingEmail, emailExists, handleSubmit } = useSupplierForm({
    supplier,
    mode,
    onSubmit,
    onClose,
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? 'Nouveau Fournisseur'
              : 'Modifier le Fournisseur'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Créer un nouveau fournisseur de stock'
              : 'Modifier les informations du fournisseur'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du fournisseur *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Metro, Carrefour..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du contact *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="contact@fournisseur.com"
                          {...field}
                          className={emailExists ? 'border-destructive' : ''}
                        />
                        {checkingEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        {!checkingEmail && field.value && !emailExists && mode === 'create' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                        {!checkingEmail && emailExists && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {emailExists && (
                      <FormDescription className="text-destructive">
                        Cet email est déjà utilisé par un autre fournisseur
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories - Checkboxes */}
            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Catégories *</FormLabel>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <FormItem key={cat.value} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={form.watch('categories')?.includes(cat.value)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('categories') || []
                              form.setValue(
                                'categories',
                                checked
                                  ? [...current, cat.value]
                                  : current.filter((c) => c !== cat.value)
                              )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{cat.label}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations complémentaires..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DLC Alert Configuration */}
            <SupplierDLCAlertFields control={form.control} />

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || emailExists || checkingEmail}>
                {loading
                  ? 'En cours...'
                  : mode === 'create'
                    ? 'Créer'
                    : 'Mettre à jour'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
