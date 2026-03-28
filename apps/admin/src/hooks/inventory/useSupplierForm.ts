'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import type { Supplier, SupplierFormData } from '@/types/inventory'

// Validation schema
const supplierSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  contact: z.string().min(2, 'Le contact doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  categories: z
    .array(z.enum(['food', 'cleaning', 'emballage', 'papeterie', 'divers']))
    .min(1, 'Sélectionnez au moins une catégorie'),
  notes: z.string().optional(),
  deliveryReminderMessage: z.string().optional(),
  requiresStockManagement: z.boolean().optional(),
  dlcAlertConfig: z.object({
    enabled: z.boolean(),
    days: z.array(z.number().min(0).max(6)),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm requis'),
  }).optional(),
}).refine(
  (data) => !data.dlcAlertConfig?.enabled || (data.dlcAlertConfig?.days?.length ?? 0) > 0,
  {
    message: 'Sélectionnez au moins un jour pour les alertes',
    path: ['dlcAlertConfig.days'],
  }
)

const DEFAULT_FORM_VALUES: SupplierFormData = {
  name: '',
  contact: '',
  email: '',
  phone: '',
  categories: [],
  notes: '',
  deliveryReminderMessage: '',
  requiresStockManagement: true,
  dlcAlertConfig: {
    enabled: false,
    days: [],
    time: '09:00',
  },
}

interface UseSupplierFormParams {
  supplier?: Supplier | null
  mode: 'create' | 'edit'
  onSubmit: (data: SupplierFormData) => Promise<boolean>
  onClose: () => void
}

export function useSupplierForm({
  supplier,
  mode,
  onSubmit,
  onClose,
}: UseSupplierFormParams) {
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const { toast } = useToast()

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  // Check if email already exists (debounced)
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || mode === 'edit') {
      setEmailExists(false)
      return
    }

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
        const exactMatch = data.data.some(
          (s: Supplier) => s.email?.toLowerCase() === email.toLowerCase()
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
      if (email) {
        checkEmailAvailability(email)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [form.watch('email'), checkEmailAvailability, form])

  // Populate form when editing, reset when creating
  useEffect(() => {
    if (mode === 'edit' && supplier) {
      form.reset({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone || '',
        categories: supplier.categories,
        notes: supplier.notes || '',
        requiresStockManagement: supplier.requiresStockManagement ?? true,
        dlcAlertConfig: supplier.dlcAlertConfig || {
          enabled: false,
          days: [],
          time: '09:00',
        },
      })
      setEmailExists(false)
    } else if (mode === 'create') {
      form.reset(DEFAULT_FORM_VALUES)
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
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    loading,
    checkingEmail,
    emailExists,
    handleSubmit,
  }
}
