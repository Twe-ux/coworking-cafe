import { useState } from 'react'
import type { Employee } from '@/types/hr'
import type { EmployeeFormData, FormErrors, ServerError } from './types'
import { validateEmployeeForm, parseServerErrors } from './validation'

interface UseEmployeeCreateOptions {
  onSuccess: (employee: Employee) => void
  onClose: () => void
}

export function useEmployeeCreate({
  onSuccess,
  onClose,
}: UseEmployeeCreateOptions) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    color: 'bg-blue-500',
    startDate: new Date().toISOString().split('T')[0],
    pin: '1111',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      color: 'bg-blue-500',
      startDate: new Date().toISOString().split('T')[0],
      pin: '1111',
    })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateEmployeeForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result: ServerError = await response.json()

      if (result.success) {
        onSuccess(result.data as Employee)
        handleClose()
      } else {
        if (result.details && Array.isArray(result.details)) {
          setErrors(parseServerErrors(result.details))
        } else {
          setErrors({
            general: result.error || "Erreur lors de la création de l'employé",
          })
        }
      }
    } catch (error) {
      console.error('Erreur création employé:', error)
      setErrors({ general: 'Erreur de connexion au serveur' })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    isLoading,
    errors,
    handleInputChange,
    handleSubmit,
    handleClose,
  }
}
