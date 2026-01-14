"use client"

import { useState, useMemo } from "react"
import { useAccountingData } from "@/hooks/use-accounting-data"
import { useChartData } from "@/hooks/use-chart-data"
import { columns } from "@/components/accounting/cash-control/columns"
import { DataTable } from "@/components/accounting/cash-control/data-table"
import type { CashEntry, CashEntryFormData, CashEntryRow } from "@/types/accounting"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const monthsList = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export default function CashControlPage() {
  const { dataCash, isLoading: isLoadingCash, refetch } = useAccountingData()
  const { data: turnoverData, isLoading: isLoadingTurnover } = useChartData()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)

  const [form, setForm] = useState<CashEntryFormData>({
    _id: "",
    date: "",
    prestaB2B: [{ label: "", value: "" }],
    depenses: [{ label: "", value: "" }],
    virement: "",
    especes: "",
    cbClassique: "",
    cbSansContact: "",
  })

  const [formStatus, setFormStatus] = useState<string | null>(null)

  // Extraire les années disponibles
  const years = useMemo(() => {
    if (!turnoverData) return [currentYear]
    const allYears = turnoverData.map((item) =>
      new Date(item.date).getFullYear()
    )
    return Array.from(new Set(allYears)).sort((a, b) => b - a)
  }, [turnoverData, currentYear])

  // Filtrer les données turnover par année/mois
  const filteredTurnoverData = useMemo(() => {
    if (!turnoverData) return []
    return turnoverData.filter((item) => {
      const d = new Date(item.date)
      const yearMatch = d.getFullYear() === selectedYear
      const monthMatch = d.getMonth() === selectedMonth
      return yearMatch && monthMatch
    })
  }, [turnoverData, selectedYear, selectedMonth])

  // Merger les données turnover + cashEntries
  const mergedData = useMemo(() => {
    if (!filteredTurnoverData && !dataCash) return []

    const allDatesMap = new Map()

    // Ajouter toutes les dates de turnover
    filteredTurnoverData?.forEach((turnoverItem) => {
      allDatesMap.set(turnoverItem.date, {
        ...turnoverItem,
        TVA: turnoverItem.TVA ?? 0,
        source: 'turnover',
      })
    })

    // Ajouter toutes les dates de cashEntry qui correspondent aux filtres
    dataCash?.forEach((entry: CashEntry) => {
      const entryDate = entry._id

      // Vérifier si cette date correspond aux filtres actuels
      if (entryDate) {
        const d = new Date(entryDate.replace(/\//g, '-'))
        const yearMatch = d.getFullYear() === selectedYear
        const monthMatch = d.getMonth() === selectedMonth

        if (yearMatch && monthMatch) {
          const existing = allDatesMap.get(entryDate)
          if (existing) {
            allDatesMap.set(entryDate, { ...existing, ...entry })
          } else {
            allDatesMap.set(entryDate, {
              date: entryDate,
              TTC: 0,
              HT: 0,
              TVA: 0,
              ...entry,
              source: 'cashEntry',
            })
          }
        }
      }
    })

    // Convertir le Map en tableau et formater
    return Array.from(allDatesMap.values())
      .map((item: any) => ({
        ...item,
        _id: item._id || item.date,
        prestaB2B: item.prestaB2B || [],
        depenses: item.depenses || [],
        virement: item.virement || null,
        especes: item.especes || null,
        cbClassique: item.cbClassique || null,
        cbSansContact: item.cbSansContact || null,
      }))
      .sort(
        (a, b) =>
          new Date(a.date.replace(/\//g, '-')).getTime() -
          new Date(b.date.replace(/\//g, '-')).getTime()
      )
  }, [filteredTurnoverData, dataCash, selectedYear, selectedMonth])

  // Transformer les données mergées en lignes pour le tableau
  const tableData: CashEntryRow[] = mergedData.map((entry: any) => {
    const totalB2B = entry.prestaB2B?.reduce(
      (sum: number, item: any) => sum + (item.value || 0),
      0
    ) || 0

    const totalDepenses = entry.depenses?.reduce(
      (sum: number, item: any) => sum + (item.value || 0),
      0
    ) || 0

    const totalCA = totalB2B - totalDepenses

    const totalEncaissements =
      (entry.especes || 0) +
      (entry.virement || 0) +
      (entry.cbClassique || 0) +
      (entry.cbSansContact || 0)

    return {
      _id: entry._id,
      date: entry.date || entry._id,
      TTC: entry.TTC || 0,
      HT: entry.HT || 0,
      TVA: entry.TVA || 0,
      totalCA,
      totalEncaissements,
      totalB2B,
      totalDepenses,
      especes: entry.especes || 0,
      virement: entry.virement || 0,
      cbClassique: entry.cbClassique || 0,
      cbSansContact: entry.cbSansContact || 0,
      prestaB2B: entry.prestaB2B || [],
      depenses: entry.depenses || [],
    }
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus(null)

    // Formater la date pour l'envoi
    let dateToSend = form.date
    if (dateToSend.includes('/')) {
      dateToSend = dateToSend.replace(/\//g, '-')
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToSend)) {
      const d = new Date(dateToSend)
      if (!isNaN(d.getTime())) {
        dateToSend = d.toISOString().slice(0, 10)
      }
    }

    // Formater la date en YYYY/MM/DD pour la clé MongoDB
    const dateKey = dateToSend.replace(/-/g, '/')

    // Préparer les données à envoyer
    const bodyData: any = {
      date: dateToSend,
      prestaB2B: form.prestaB2B
        .filter((p) => p.label && p.value !== '' && !isNaN(Number(p.value)))
        .map((p) => ({
          label: p.label,
          value: Number(p.value),
        })),
      depenses: form.depenses
        .filter((d) => d.label && d.value !== '' && !isNaN(Number(d.value)))
        .map((d) => ({
          label: d.label,
          value: Number(d.value),
        })),
      virement: form.virement !== '' ? Number(form.virement) : 0,
      especes: form.especes !== '' ? Number(form.especes) : 0,
      cbClassique: form.cbClassique !== '' ? Number(form.cbClassique) : 0,
      cbSansContact: form.cbSansContact !== '' ? Number(form.cbSansContact) : 0,
    }

    let url = '/api/cash-entry'
    let method: 'POST' | 'PUT' = 'POST'

    if (form._id) {
      // Mode édition
      url = '/api/cash-entry/update'
      method = 'PUT'
      bodyData.id = form._id
    } else {
      // Mode création
      bodyData._id = dateKey
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })

      const result = await res.json()

      if (result.success) {
        setFormStatus(form._id ? 'Modification réussie !' : 'Ajout réussi !')

        // Rafraîchir les données
        await refetch()

        // Fermer le modal après un court délai
        setTimeout(() => {
          setFormStatus(null)
          window.dispatchEvent(new CustomEvent('cash-modal-close'))
        }, 1500)
      } else {
        setFormStatus('Erreur : ' + (result.error || "Impossible d'enregistrer"))
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setFormStatus('Erreur réseau')
    }
  }

  const handleDelete = (row: CashEntryRow) => {
    console.log("Delete row:", row)
    refetch()
  }

  if (isLoadingCash || isLoadingTurnover) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/accounting">Comptabilité</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Contrôle de Caisse</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Contrôle de Caisse
            </h1>

            {/* Filtres Année/Mois */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Année :</span>
                <select
                  className="rounded border px-3 py-1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Mois :</span>
                <select
                  className="rounded border px-3 py-1"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthsList.map((month, idx) => (
                    <option key={month} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={tableData}
            form={form}
            setForm={setForm}
            formStatus={formStatus}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  )
}
