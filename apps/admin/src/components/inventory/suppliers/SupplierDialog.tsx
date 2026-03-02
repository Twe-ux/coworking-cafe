'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useToast } from '@/hooks/use-toast'
import type { Supplier, SupplierFormData } from '@/types/inventory'

// Validation schema
const supplierSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  contact: z.string().min(2, 'Le contact doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone invalide'),
  address: z.string().optional(),
  categories: z
    .array(z.enum(['food', 'cleaning']))
    .min(1, 'Sélectionnez au moins une catégorie'),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
})

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
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const { toast } = useToast()

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      categories: [],
      paymentTerms: '',
      notes: '',
    },
  })

  // Check if email already exists (debounced)
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || mode === 'edit') {
      setEmailExists(false)
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailExists(false)
      return
    }

    setCheckingEmail(true)
    try {
      const res = await fetch(`/api/inventory/suppliers?search=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.success && data.data) {
        // Check if exact email match exists
        const exactMatch = data.data.some(
          (s: Supplier) => s.email.toLowerCase() === email.toLowerCase()
        )
        setEmailExists(exactMatch)
      } else {
        setEmailExists(false)
      }
    } catch (error) {
      console.error('Error checking email:', error)
      setEmailExists(false)
    } finally {
      setCheckingEmail(false)
    }
  }, [mode])

  // Debounce email check
  useEffect(() => {
    const email = form.watch('email')
    const timeoutId = setTimeout(() => {
      checkEmailAvailability(email)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [form.watch('email'), checkEmailAvailability, form])

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && supplier) {
      form.reset({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address || '',
        categories: supplier.categories,
        paymentTerms: supplier.paymentTerms || '',
        notes: supplier.notes || '',
      })
      setEmailExists(false)
    } else if (mode === 'create') {
      form.reset({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        categories: [],
        paymentTerms: '',
        notes: '',
      })
      setEmailExists(false)
    }
  }, [mode, supplier, form])

  const handleSubmit = async (data: SupplierFormData) => {
    setLoading(true)
    try {
      const success = await onSubmit(data)
      if (success) {
        toast({
          title: 'Succès',
          description:
            mode === 'create'
              ? 'Fournisseur créé avec succès'
              : 'Fournisseur mis à jour avec succès',
        })
        onClose()
        form.reset()
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

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
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Rue de Paris, 75001 Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={form
                            .watch('categories')
                            ?.includes('food')}
                          onCheckedChange={(checked) => {
                            const current = form.getValues('categories') || []
                            if (checked) {
                              form.setValue('categories', [...current, 'food'])
                            } else {
                              form.setValue(
                                'categories',
                                current.filter((c) => c !== 'food')
                              )
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Alimentation
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={form
                            .watch('categories')
                            ?.includes('cleaning')}
                          onCheckedChange={(checked) => {
                            const current = form.getValues('categories') || []
                            if (checked) {
                              form.setValue('categories', [
                                ...current,
                                'cleaning',
                              ])
                            } else {
                              form.setValue(
                                'categories',
                                current.filter((c) => c !== 'cleaning')
                              )
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Entretien</FormLabel>
                    </FormItem>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Terms */}
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions de paiement</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 30 jours fin de mois"
                      {...field}
                    />
                  </FormControl>
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
