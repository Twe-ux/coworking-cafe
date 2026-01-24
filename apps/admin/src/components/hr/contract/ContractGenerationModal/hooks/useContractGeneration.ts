/**
 * Hook for PDF contract generation
 * Handles PDF creation and employee status update
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Employee, UseContractGenerationReturn } from '../types'

interface UseContractGenerationOptions {
  employee: Employee
  contractRef: React.RefObject<HTMLDivElement | null>
  onSuccess?: () => void
}

/**
 * Generate multi-page PDF from HTML element
 */
async function generateMultiPagePDF(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 1,
    useCORS: true,
    logging: false,
    imageTimeout: 0,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.7)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pdfWidth
  const imgHeight = (canvas.height * pdfWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
  heightLeft -= pdfHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight
  }

  pdf.save(fileName)
}

/**
 * Update employee onboarding status after contract generation
 */
async function updateEmployeeStatus(employeeId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/hr/employees/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        onboardingStatus: {
          step4Completed: true,
          contractGenerated: true,
          contractGeneratedAt: new Date(),
        },
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error updating employee status:', error)
    return false
  }
}

export function useContractGeneration({
  employee,
  contractRef,
  onSuccess,
}: UseContractGenerationOptions): UseContractGenerationReturn {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)

  const generatePDF = useCallback(async () => {
    const element = contractRef.current
    if (!element) return

    setGenerating(true)

    try {
      // Generate PDF file name
      const fileName = `Contrat_CDI_${employee.lastName}_${employee.firstName}.pdf`

      // Generate and download PDF
      await generateMultiPagePDF(element, fileName)

      // Update employee status if employee has ID
      if (employee._id) {
        const updated = await updateEmployeeStatus(employee._id)
        if (!updated) {
          console.error('Failed to update employee onboarding status')
        }
      }

      // Call success callback and redirect
      onSuccess?.()
      router.push('/admin/hr/employees')
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Erreur lors de la generation du PDF')
    } finally {
      setGenerating(false)
    }
  }, [employee, contractRef, onSuccess, router])

  return {
    generating,
    generatePDF,
  }
}
