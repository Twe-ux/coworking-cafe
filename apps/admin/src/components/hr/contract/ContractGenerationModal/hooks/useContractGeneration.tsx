'use client'

/**
 * Hook for PDF contract generation using @react-pdf/renderer
 * Handles PDF download and email sending (client-side generation)
 * Based on the pattern from /archive_pdf/lib/pdf-utils.ts
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import type { Employee, UseContractGenerationReturn } from '../types'

/**
 * Type for the pdf() function from @react-pdf/renderer
 * @see https://github.com/diegomura/react-pdf/blob/master/packages/renderer/index.d.ts#L652
 */
type PDFFunction = (initialValue?: React.ReactElement) => {
  container: unknown
  isDirty: () => boolean
  toString: () => string
  toBlob: () => Promise<Blob>
  toBuffer: () => Promise<NodeJS.ReadableStream>
  on: (event: 'change', callback: () => void) => void
  updateContainer: (document: React.ReactElement, callback?: () => void) => void
  removeListener: (event: 'change', callback: () => void) => void
}

interface UseContractGenerationOptions {
  employee: Employee
  monthlySalary: string
  monthlyHours: string
  onSuccess?: () => void
}

export function useContractGeneration({
  employee,
  monthlySalary,
  monthlyHours,
  onSuccess,
}: UseContractGenerationOptions): UseContractGenerationReturn {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  /**
   * Generate PDF blob using @react-pdf/renderer (dynamically loaded)
   */
  const generatePDFBlob = useCallback(async (): Promise<Blob> => {
    // Ensure we're running client-side
    if (typeof window === 'undefined') {
      throw new Error('PDF generation can only run client-side')
    }

    try {
      // Import PDF renderer and component dynamically (like in archive_pdf/lib/pdf-utils.ts)
      const { pdf } = await import('@react-pdf/renderer')
      const { default: ContractDocument } = await import('@/lib/pdf/templates/contract/ContractDocument')

      // Generate PDF using React.createElement (like in archive)
      const pdfElement = React.createElement(ContractDocument, {
        employee,
        monthlySalary,
        monthlyHours,
      })

      console.log('PDF Element créé, génération du blob...')
      const pdfInstance = (pdf as PDFFunction)(pdfElement)
      const blob = await pdfInstance.toBlob()
      console.log('Blob généré avec succès, taille:', blob.size)

      return blob
    } catch (error) {
      console.error('Erreur détaillée lors de la génération du PDF:', error)
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message)
        console.error('Stack trace:', error.stack)
      }
      throw new Error(`Erreur PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }, [employee, monthlySalary, monthlyHours])

  /**
   * Generate and download PDF
   */
  const generatePDF = useCallback(async () => {
    setGenerating(true)

    try {
      const pdfBlob = await generatePDFBlob()

      // Create download link
      const fileName = `Contrat_CDI_${employee.lastName}_${employee.firstName}.pdf`
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('PDF téléchargé avec succès')

      // Call success callback
      onSuccess?.()

      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin/hr/employees')
      }, 1000)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }, [employee, generatePDFBlob, onSuccess, router])

  /**
   * Generate PDF and send via email
   */
  const sendEmail = useCallback(
    async (recipientEmail?: string) => {
      if (!employee._id) {
        alert('Erreur: ID employé manquant')
        return
      }

      setSending(true)

      try {
        // Generate PDF blob
        const pdfBlob = await generatePDFBlob()

        // Create form data to send PDF to server
        const formData = new FormData()
        formData.append('employeeId', employee._id)
        formData.append('recipientEmail', recipientEmail || employee.email || '')
        formData.append('pdf', pdfBlob, `Contrat_CDI_${employee.lastName}_${employee.firstName}.pdf`)

        // Call API to send email with PDF
        const response = await fetch('/api/hr/contract/send-email', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erreur lors de l'envoi de l'email")
        }

        // Call success callback
        onSuccess?.()

        // Show success message
        const toEmail = recipientEmail || employee.email
        alert(`Email envoyé avec succès à ${toEmail}`)

        // Redirect after short delay
        setTimeout(() => {
          router.push('/admin/hr/employees')
        }, 500)
      } catch (error) {
        console.error('Email sending error:', error)
        alert(error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email")
      } finally {
        setSending(false)
      }
    },
    [employee, generatePDFBlob, onSuccess, router]
  )

  return {
    generating,
    sending,
    generatePDF,
    sendEmail,
  }
}
