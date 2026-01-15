'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { FileText, FileDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import type { Employee } from '@/types/hr'

interface ContractGenerationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
] as const

export function ContractGenerationModal({
  open,
  onOpenChange,
  employee,
}: ContractGenerationModalProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(true)
  const [generating, setGenerating] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)

  const monthlySalary = employee.hourlyRate
    ? (employee.hourlyRate * employee.contractualHours * 4.33).toFixed(2)
    : '0.00'

  const calculateDayHours = (
    slots: Array<{ start: string; end: string }>
  ) => {
    let totalMinutes = 0
    slots.forEach((slot) => {
      const [startH, startM] = slot.start.split(':').map(Number)
      const [endH, endM] = slot.end.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      totalMinutes += endMinutes - startMinutes
    })
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`
  }

  const renderAvailabilityTable = () => {
    if (!employee.availability) {
      return <div>Tableau des plages horaires à compléter selon les besoins</div>
    }

    return (
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
          fontSize: '9pt',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#e9ecef' }}>
            <th
              style={{
                border: '1px solid #000',
                padding: '6px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '20%',
              }}
            >
              Jour
            </th>
            <th
              style={{
                border: '1px solid #000',
                padding: '6px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '30%',
              }}
            />
            <th
              style={{
                border: '1px solid #000',
                padding: '6px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '30%',
              }}
            />
            <th
              style={{
                border: '1px solid #000',
                padding: '6px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '20%',
              }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map(({ key, label }) => {
            const schedule = employee.availability![key]
            const isAvailable =
              schedule?.available && schedule?.slots && schedule.slots.length > 0
            const sortedSlots = isAvailable
              ? [...schedule.slots].sort((a, b) => a.start.localeCompare(b.start))
              : []
            const totalHours = isAvailable ? calculateDayHours(sortedSlots) : ''

            let firstSlot = ''
            let secondSlot = ''

            if (sortedSlots.length >= 1) {
              firstSlot = `${sortedSlots[0].start} - ${sortedSlots[0].end}`
            }
            if (sortedSlots.length >= 2) {
              secondSlot = `${sortedSlots[1].start} - ${sortedSlots[1].end}`
            }

            return (
              <tr
                key={key}
                style={!isAvailable ? { backgroundColor: '#f8f9fa' } : {}}
              >
                <td
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {label}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                  {firstSlot}
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                  {secondSlot}
                </td>
                <td
                  style={{
                    border: '1px solid #000',
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {totalHours}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  const renderDistributionTable = () => {
    const weeklyDistributionData = employee.workSchedule?.weeklyDistributionData

    if (!weeklyDistributionData) {
      return <div>Tableau de répartition hebdomadaire à compléter selon le planning</div>
    }

    return (
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
          fontSize: '9pt',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#e9ecef' }}>
            <th
              style={{
                border: '1px solid #000',
                padding: '6px',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              Jour
            </th>
            {['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'].map((week) => (
              <th
                key={week}
                style={{
                  border: '1px solid #000',
                  padding: '6px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(({ key, label }) => {
            const schedule = employee.availability?.[key]
            return (
              <tr
                key={key}
                style={!schedule?.available ? { backgroundColor: '#f8f9fa' } : {}}
              >
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
                  {label}
                </td>
                {['week1', 'week2', 'week3', 'week4'].map((week) => (
                  <td
                    key={week}
                    style={{
                      border: '1px solid #000',
                      padding: '6px',
                      textAlign: 'center',
                    }}
                  >
                    {schedule?.available
                      ? `${weeklyDistributionData[key]?.[week] || '0'}h`
                      : 'Repos'}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
            <td style={{ border: '1px solid #000', padding: '6px' }}>Total</td>
            {['week1', 'week2', 'week3', 'week4'].map((week) => {
              const total = DAYS.reduce((sum, { key }) => {
                const hours = parseFloat(weeklyDistributionData[key]?.[week] || '0')
                return sum + hours
              }, 0)
              return (
                <td
                  key={week}
                  style={{
                    border: '1px solid #000',
                    padding: '6px',
                    textAlign: 'center',
                  }}
                >
                  {total.toFixed(1)}h
                </td>
              )
            })}
          </tr>
        </tfoot>
      </table>
    )
  }

  const handleGeneratePDF = async () => {
    if (!contractRef.current) return

    setGenerating(true)
    try {
      const element = contractRef.current
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

      pdf.save(`Contrat_CDI_${employee.lastName}_${employee.firstName}.pdf`)

      if (employee._id) {
        const response = await fetch(`/api/hr/employees/${employee._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onboardingStatus: {
              ...employee.onboardingStatus,
              step4Completed: true,
              contractGenerated: true,
              contractGeneratedAt: new Date(),
            },
          }),
        })

        if (!response.ok) {
          console.error('Erreur lors de la mise à jour du statut')
        }
      }

      onOpenChange(false)
      router.push('/hr')
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contrat de Travail - {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Switch
              id="edit-mode"
              checked={isEditing}
              onCheckedChange={setIsEditing}
            />
            <Label htmlFor="edit-mode">
              {isEditing ? 'Mode édition activé' : 'Mode lecture seule'}
            </Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {isEditing
              ? 'Vous pouvez modifier le contrat avant de le générer'
              : 'Prévisualisation finale'}
          </span>
        </div>

<div
          ref={contractRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          style={{
            padding: '60px 300px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            minHeight: '800px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11pt',
            lineHeight: '1.6',
          }}
        >
          {/* Titre */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1
              style={{
                fontSize: '13pt',
                fontWeight: 'bold',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              CONTRAT DE TRAVAIL MENSUEL À TEMPS{' '}
              {employee.contractualHours >= 35 ? 'COMPLET' : 'PARTIEL'} À DURÉE
              INDÉTERMINÉE
            </h1>
            <p style={{ fontSize: '10pt', fontStyle: 'italic', margin: 0 }}>
              Durée du travail répartie sur les semaines du mois
            </p>
          </div>

          {/* Entre les soussignés */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '15px' }}>
              Entre les soussignés
            </h3>

            {/* Informations employeur */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '15px',
                border: '1px solid #000',
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      border: '1px solid #000',
                      padding: '8px',
                      width: '40%',
                      fontWeight: 'bold',
                    }}
                  >
                    Société (raison sociale)
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>ILY SARL</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Adresse
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    1 RUE DE LA DIVISION LECLERC
                    <br />
                    67000 STRASBOURG
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Représentée par
                    <br />
                    Agissant en qualité de
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    MILONE Thierry
                    <br />
                    Gérant
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Code NAF
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>5630 Z</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Immatriculée à l'URSSAF de
                    <br />
                    Numéro d'immatriculation
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    D'ALSACE (427)
                    <br />
                    n° 829 552 264 000 22
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>Ci-après l'Employeur</p>

            {/* Informations employé */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '15px',
                border: '1px solid #000',
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      border: '1px solid #000',
                      padding: '8px',
                      width: '40%',
                      fontWeight: 'bold',
                    }}
                  >
                    Nom
                    <br />
                    Prénom(s)
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {employee.lastName}
                    <br />
                    {employee.firstName}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Date et lieu de naissance
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {new Date(employee.dateOfBirth).toLocaleDateString('fr-FR')}
                    <br />
                    {employee.placeOfBirth ?? ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Numéro de sécurité sociale
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {employee.socialSecurityNumber}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Adresse du domicile
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {employee.address?.street ?? ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Code postal
                    <br />
                    Ville
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {employee.address?.postalCode ?? ''}
                    <br />
                    {employee.address?.city ?? ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    Nationalité
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>FRANÇAISE</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    N° Titre de séjour - travail
                    <br />
                    Date d'expiration
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px' }} />
                </tr>
              </tbody>
            </table>
            <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>Ci-après le Salarié</p>

            <p style={{ marginTop: '20px', lineHeight: '1.6' }}>
              Le présent contrat est conclu à durée indéterminée à temps{' '}
              {employee.contractualHours >= 35 ? 'complet' : 'partiel'}. Il est régi par
              les dispositions générales de la{' '}
              <strong>Convention Collective Nationale des Hôtels, Cafés, Restaurants</strong>{' '}
              du 30 avril 1997, dont le Salarié reconnaît avoir pris connaissance et les
              conditions particulières ci-après :
            </p>
          </div>

          {/* Article 1 - Engagement et période d'essai */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 1 - Engagement et période d'essai
            </h4>
            <p style={{ marginBottom: '12px' }}>
              La déclaration préalable à l'embauche a été adressée à l'URSSAF d'Alsace
              (427), le{' '}
              <strong>
                {employee.onboardingStatus?.dpaeCompletedAt
                  ? new Date(employee.onboardingStatus.dpaeCompletedAt).toLocaleDateString(
                      'fr-FR'
                    )
                  : '[DATE DPAE]'}
              </strong>
              <br />
              Le Salarié est engagé pour une durée indéterminée et à temps{' '}
              {employee.contractualHours >= 35 ? 'complet' : 'partiel'} :
            </p>

            <table
              style={{
                width: '60%',
                borderCollapse: 'collapse',
                marginBottom: '15px',
                border: '1px solid #000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px', width: '50%' }}>
                    En qualité de
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    Équipier polyvalent
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Niveau</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {employee.level ?? ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Echelon</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {employee.step ?? ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Date d'entrée</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {new Date(employee.hireDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>Heure</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    {employee.hireTime ?? '9H30'}
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ marginBottom: '10px' }}>
              Il ne deviendra définitif qu'à l'expiration d'une période d'essai de{' '}
              <strong>deux mois</strong>.
            </p>
            <p style={{ marginBottom: '10px' }}>
              La période d'essai pourra être renouvelée d'une période au maximum égale à{' '}
              <strong>deux mois</strong>.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Le renouvellement de la période d'essai devra être formalisé par un accord
              écrit, signé des deux parties, au moins trois jours ouvrables avant la fin de la
              période d'essai initiale.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Pendant la période d'essai, les parties pourront résilier le contrat de travail
              en respectant les délais de prévenance minimaux prévus par les dispositions
              légales et conventionnelles.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Toute suspension qui se produirait pendant la période d'essai (maladie, congés…)
              prolongerait d'autant la durée de cette période qui doit correspondre à un
              travail effectif.
            </p>
            <p>
              Le Salarié déclare n'être lié à aucune autre entreprise et avoir quitté son
              précédent employeur libre de tout engagement. Dans le cas contraire, les
              dispositions prévues à l'article 8 s'appliquent.
            </p>
          </div>

          {/* Article 2 - Fonctions */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 2 - Fonctions
            </h4>
            <p style={{ marginBottom: '10px' }}>
              Le Salarié exercera les fonctions d'employé polyvalent et sera à ce titre,
              notamment en charge des tâches suivantes :
            </p>
            <ul style={{ marginLeft: '30px', marginBottom: '10px', lineHeight: '1.6' }}>
              <li>Accueillir, servir et être à l'écoute des clients ;</li>
              <li>
                Promouvoir la Société auprès des clients en expliquant le concept du Coworking
                Café ;
              </li>
              <li>
                Préparer et servir les boissons et la nourriture proposés dans
                l'établissement, dans le respect des règles d'hygiène ;
              </li>
              <li>
                Veiller à la propreté et au parfait état des locaux et du mobilier s'y
                trouvant ;
              </li>
              <li>
                Procéder à l'encaissement des clients et assurer la sécurité de la caisse dans
                le respect des consignes spécifiques relatifs aux flux financiers ;
              </li>
              <li>
                D'une manière générale, faire son mieux pour assurer un haut niveau de qualité
                de service auprès des clients et assurer le bon fonctionnement de
                l'établissement.
              </li>
            </ul>
            <p>
              Les attributions du Salarié sont évolutives et pourront faire l'objet de
              modifications, de précisions ou de compléments, temporaires ou définitifs, sans
              que cela puisse être considéré comme une modification du contrat de travail.
            </p>
            <p style={{ marginTop: '12px' }}>
              Afin de permettre au Salarié d'appréhender au mieux le contenu de ses futures
              fonctions et les spécificités liées à la nature de notre activité, le Salarié
              bénéficiera d'une formation continue.
            </p>
          </div>

          {/* Article 3 - Lieu de travail */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 3 - Lieu de travail
            </h4>
            <p>
              Le Salarié exercera ses fonctions au sein de l'établissement situé{' '}
              <strong>1 rue de la Division Leclerc 67000 Strasbourg</strong>. Toutefois, il
              pourra être affecté de manière temporaire à un autre établissement de la même
              enseigne.
            </p>
          </div>

          {/* Article 4 - Durée mensuelle du travail */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 4 - Durée mensuelle du travail
            </h4>
            <p style={{ marginBottom: '12px' }}>
              Le présent contrat de travail est conclu pour une durée mensuelle du travail de{' '}
              <strong>{(employee.contractualHours * 4.33).toFixed(2)} heures</strong>.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Conformément aux dispositions conventionnelles applicables, il est expressément
              convenu que la durée du travail du Salarié, notifiée dans les conditions
              énoncées à l'article 5 du présent contrat, sera programmée dans les plages de
              planification possible définies ci-après :
            </p>
            <p style={{ marginBottom: '10px', fontStyle: 'italic' }}>
              La durée mensuelle de travail a été divisée par 4,33 semaines en moyenne par
              mois pour obtenir la référence horaire hebdomadaire servant à définir le volant
              des plages de planification possible.
            </p>
            <div style={{ marginBottom: '10px' }}>{renderAvailabilityTable()}</div>
          </div>

          {/* Article 5 - Répartition de la durée du travail */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 5 - Répartition de la durée du travail
            </h4>
            <p style={{ marginBottom: '12px' }}>
              La répartition des heures sur les semaines du mois est indiquée ci-après. Cette
              répartition est effectuée dans le respect des plages de planification possible
              visées à l'article 4.
            </p>
            <div style={{ marginBottom: '10px' }}>{renderDistributionTable()}</div>
            <p style={{ marginBottom: '10px' }}>
              En ce qui concerne les jours de repos hebdomadaires, il a été convenu en accord
              avec le Salarié et conformément aux dispositions conventionnelles que les 2
              jours de repos hebdomadaires sont fixés contractuellement dans le tableau de
              répartition ci-dessus.
            </p>
          </div>

          {/* Article 6 - Heures complémentaires */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 6 - Heures complémentaires
            </h4>
            <p style={{ marginBottom: '10px' }}>
              Il est convenu qu'en fonction des besoins de l'entreprise, le Salarié pourra
              être amené à effectuer des heures complémentaires, dans la limite du tiers de la
              durée initiale du contrat par semaine.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Les heures complémentaires effectuées en-deçà du 1/10 de la durée initialement
              fixée au contrat seront majorées à <strong>10%</strong>.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Les heures complémentaires effectuées au-delà du 1/10 de la durée initialement
              fixée au contrat seront majorées à <strong>25%</strong>.
            </p>
          </div>

          {/* Article 7 - Rémunération */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 7 - Rémunération
            </h4>
            <p style={{ marginBottom: '12px' }}>
              Le Salarié percevra une rémunération mensualisée brute de{' '}
              <strong>{monthlySalary} €</strong>
              <br />
              correspondant à sa durée de travail mensuelle de{' '}
              <strong>{(employee.contractualHours * 4.33).toFixed(2)}</strong> heures
              <br />
              sur la base d'un taux horaire de{' '}
              <strong>{employee.hourlyRate?.toFixed(2) ?? ''} €</strong>
            </p>
            <p>
              Sur cette rémunération seront prélevées les cotisations sociales et notamment
              celles afférentes au régime de protection sociale en vigueur dans la société à
              la date de versement.
            </p>
          </div>

          {/* Articles 8-14 (version condensée pour respecter limite lignes) */}
          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 8 - Cumul d'emplois
            </h4>
            <p>
              Le Salarié s'engage à porter à la connaissance de l'Employeur tout autre emploi
              à temps partiel qu'il pourrait occuper.
            </p>
          </div>

          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 9 - Congés payés
            </h4>
            <p>
              Le Salarié bénéficiera des congés payés conformément aux dispositions légales et
              conventionnelles en vigueur.
            </p>
          </div>

          <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h4
              style={{
                fontSize: '11pt',
                fontWeight: 'bold',
                marginBottom: '12px',
                textDecoration: 'underline',
              }}
            >
              Article 10 - Absence et maladie
            </h4>
            <p>
              Toute absence doit être portée à la connaissance de la Direction par tous
              moyens et dans les plus brefs délais.
            </p>
          </div>

          {/* Signature */}
          <div style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
            <p style={{ marginBottom: '20px' }}>
              Fait en deux exemplaires originaux dont chaque partie reconnaît avoir reçu le
              sien.
            </p>
            <p style={{ marginBottom: '40px' }}>
              <span>A </span>
              <span
                style={{
                  borderBottom: '1px solid #000',
                  paddingBottom: '2px',
                  paddingLeft: '5px',
                  paddingRight: '50px',
                  marginRight: '40px',
                }}
              >
                STRASBOURG
              </span>
              <span>Le </span>
              <span
                style={{
                  borderBottom: '1px solid #000',
                  paddingBottom: '2px',
                  paddingLeft: '5px',
                  paddingRight: '50px',
                }}
              >
                {new Date().toLocaleDateString('fr-FR')}
              </span>
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '80px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Pour la Société</p>
                <p style={{ marginBottom: '80px' }}>ILY SARL</p>
                <p
                  style={{
                    borderTop: '1px solid #000',
                    paddingTop: '5px',
                    display: 'inline-block',
                    minWidth: '200px',
                  }}
                >
                  Signature
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Le Salarié</p>
                <p style={{ marginBottom: '80px' }}>
                  {employee.lastName} {employee.firstName}
                </p>
                <p
                  style={{
                    borderTop: '1px solid #000',
                    paddingTop: '5px',
                    display: 'inline-block',
                    minWidth: '200px',
                  }}
                >
                  Signature
                  <br />
                  <span style={{ fontSize: '9pt', fontStyle: 'italic' }}>Lu et approuvé</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleGeneratePDF} disabled={generating}>
            {generating ? (
              <>Génération en cours...</>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Générer le PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
