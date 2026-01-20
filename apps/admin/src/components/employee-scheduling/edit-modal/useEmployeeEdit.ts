import { useState, useEffect } from 'react'
import { Employee } from '@/hooks/useEmployees'
import { EmployeeFormData, EmployeeFormErrors } from './types'

interface UseEmployeeEditProps {
  employee: Employee | null
  isOpen: boolean
  onSuccess: (employee: Employee) => void
  onClose: () => void
}

export function useEmployeeEdit({
  employee,
  isOpen,
  onSuccess,
  onClose,
}: UseEmployeeEditProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    color: 'bg-blue-500',
    startDate: '',
    pin: '1111',
  })
  const [errors, setErrors] = useState<EmployeeFormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Populate form with employee data
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        role: employee.employeeRole || '',
        color: employee.color || 'bg-blue-500',
        startDate: employee.hireDate
          ? new Date(employee.hireDate).toISOString().split('T')[0]
          : '',
        pin: employee.clockingCode || '1111',
      })
      setErrors({})
    }
  }, [employee, isOpen])

  const validateForm = (): boolean => {
    const newErrors: EmployeeFormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (
      formData.phone &&
      !/^(\+33|0)[1-9](\d{8})$/.test(formData.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone = 'Format de téléphone invalide (ex: 01 23 45 67 89)'
    }

    if (!formData.role) {
      newErrors.role = 'Le rôle est requis'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise'
    }

    if (!formData.pin || !/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'Le PIN doit contenir exactement 4 chiffres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!validateForm() || !employee) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/hr/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          role: formData.role,
          color: formData.color,
          startDate: formData.startDate,
          pin: formData.pin,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          setErrors({ email: 'Un employé avec cet email existe déjà' })
          return
        }
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      const updatedEmployee = await response.json()
      onSuccess(updatedEmployee)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la modification',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (): void => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      color: 'bg-blue-500',
      startDate: '',
      pin: '1111',
    })
    setErrors({})
    onClose()
  }

  return {
    formData,
    setFormData,
    errors,
    isLoading,
    handleSubmit,
    handleClose,
  }
}
