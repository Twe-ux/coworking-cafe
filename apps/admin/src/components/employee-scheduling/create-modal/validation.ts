import type { EmployeeFormData, FormErrors } from './types'

export function validateEmployeeForm(formData: EmployeeFormData): FormErrors {
  const newErrors: FormErrors = {}

  if (!formData.firstName.trim()) {
    newErrors.firstName = 'Le prénom est obligatoire'
  } else if (formData.firstName.trim().length < 2) {
    newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères'
  }

  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Le nom est obligatoire'
  } else if (formData.lastName.trim().length < 2) {
    newErrors.lastName = 'Le nom doit contenir au moins 2 caractères'
  }

  if (!formData.role) {
    newErrors.role = 'Le rôle est obligatoire'
  }

  if (
    formData.email &&
    !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
  ) {
    newErrors.email = "Format d'email invalide"
  }

  if (
    formData.phone &&
    !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.phone)
  ) {
    newErrors.phone = 'Format de téléphone français invalide'
  }

  if (!formData.pin || !/^\d{4}$/.test(formData.pin)) {
    newErrors.pin = 'Le PIN doit contenir exactement 4 chiffres'
  }

  return newErrors
}

export function parseServerErrors(details: string[]): FormErrors {
  const serverErrors: FormErrors = {}

  details.forEach((error: string) => {
    if (error.includes('prénom') || error.includes('firstName')) {
      serverErrors.firstName = error
    } else if (error.includes('nom') || error.includes('lastName')) {
      serverErrors.lastName = error
    } else if (error.includes('email')) {
      serverErrors.email = error
    } else if (error.includes('phone') || error.includes('téléphone')) {
      serverErrors.phone = error
    } else if (error.includes('rôle') || error.includes('role')) {
      serverErrors.role = error
    } else {
      serverErrors.general = error
    }
  })

  return serverErrors
}
